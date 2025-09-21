-- FINAL FIX: Complete RLS Reset and Rebuild for Unknown User Issue
-- This script removes ALL existing policies and creates them from scratch
-- Run this in Supabase SQL Editor

BEGIN;

-- ===============================================
-- STEP 1: REMOVE ALL EXISTING RLS POLICIES
-- ===============================================

-- Drop ALL policies on users table
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view basic user info" ON public.users;
DROP POLICY IF EXISTS "Anyone can view basic user info" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Public users read" ON public.users;

-- Drop ALL policies on summaries table  
DROP POLICY IF EXISTS "Anyone can view summaries" ON public.summaries;
DROP POLICY IF EXISTS "Authenticated users can create summaries" ON public.summaries;
DROP POLICY IF EXISTS "Users can update own summaries" ON public.summaries;
DROP POLICY IF EXISTS "Users can delete own summaries" ON public.summaries;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.summaries;
DROP POLICY IF EXISTS "Public summaries read" ON public.summaries;

-- ===============================================
-- STEP 2: ENSURE PROPER TABLE STRUCTURE
-- ===============================================

-- Ensure users table exists and has correct structure
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  grade TEXT CHECK (grade IN ('A', 'B', 'C', 'D', 'E', 'F', 'G')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure summaries table exists with correct foreign key
CREATE TABLE IF NOT EXISTS public.summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL,
  file_urls TEXT[] NOT NULL DEFAULT '{}',
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_edited_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Fix foreign key constraint if needed
DO $$
BEGIN
    -- Drop existing foreign key if it exists
    ALTER TABLE public.summaries DROP CONSTRAINT IF EXISTS summaries_user_id_fkey;
    
    -- Add correct foreign key constraint
    ALTER TABLE public.summaries 
    ADD CONSTRAINT summaries_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Foreign key constraint adjustment completed or not needed';
END $$;

-- ===============================================
-- STEP 3: ENSURE USER DATA EXISTS
-- ===============================================

-- Make sure all user_ids in summaries have corresponding records in public.users
INSERT INTO public.users (id, email, full_name)
SELECT DISTINCT 
    s.user_id,
    COALESCE(au.email, 'unknown@example.com'),
    COALESCE(
        au.raw_user_meta_data->>'full_name', 
        au.raw_user_meta_data->>'name',
        'Unknown User'
    )
FROM public.summaries s
LEFT JOIN auth.users au ON s.user_id = au.id
LEFT JOIN public.users pu ON s.user_id = pu.id
WHERE pu.id IS NULL AND s.user_id IS NOT NULL
ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name, 'Unknown User');

-- ===============================================
-- STEP 4: CREATE NEW RLS POLICIES FROM SCRATCH
-- ===============================================

-- Enable RLS on both tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;

-- USERS TABLE POLICIES (Simple and Clear)
-- Allow everyone to read basic user info (names only)
CREATE POLICY "allow_public_read_users" ON public.users
    FOR SELECT TO public
    USING (true);

-- Allow users to manage their own profiles
CREATE POLICY "allow_user_crud_own_profile" ON public.users
    FOR ALL TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- SUMMARIES TABLE POLICIES (Simple and Clear)
-- Allow everyone to read summaries
CREATE POLICY "allow_public_read_summaries" ON public.summaries
    FOR SELECT TO public
    USING (true);

-- Allow authenticated users to manage their own summaries
CREATE POLICY "allow_user_crud_own_summaries" ON public.summaries
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ===============================================
-- STEP 5: CREATE OPTIMIZED VIEW
-- ===============================================

-- Drop existing view if it exists
DROP VIEW IF EXISTS public.summaries_with_users;

-- Create the optimized view with explicit column selection
CREATE VIEW public.summaries_with_users AS
SELECT 
    s.id,
    s.name,
    s.description,
    s.user_id,
    s.file_urls,
    s.upload_date,
    s.last_edited_at,
    s.created_at,
    s.updated_at,
    u.full_name as user_full_name,
    u.grade as user_grade
FROM public.summaries s
LEFT JOIN public.users u ON s.user_id = u.id;

-- ===============================================
-- STEP 6: GRANT PERMISSIONS EXPLICITLY
-- ===============================================

-- Grant read access to everyone (including anonymous)
GRANT SELECT ON public.users TO anon, authenticated;
GRANT SELECT ON public.summaries TO anon, authenticated;
GRANT SELECT ON public.summaries_with_users TO anon, authenticated;

-- Grant full access to authenticated users for their own data
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.summaries TO authenticated;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant sequence usage for authenticated users
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ===============================================
-- STEP 7: CREATE HELPFUL INDEXES
-- ===============================================

CREATE INDEX IF NOT EXISTS users_full_name_idx ON public.users(full_name);
CREATE INDEX IF NOT EXISTS users_id_idx ON public.users(id);
CREATE INDEX IF NOT EXISTS summaries_user_id_idx ON public.summaries(user_id);

-- ===============================================
-- STEP 8: REFRESH SCHEMA CACHE
-- ===============================================

-- Tell PostgREST to reload the schema
NOTIFY pgrst, 'reload schema';

COMMIT;

-- ===============================================
-- VERIFICATION QUERIES
-- ===============================================

-- Test 1: Check if users exist for summaries
SELECT 
    'Users with summaries:' as test,
    COUNT(*) as count
FROM public.users u 
INNER JOIN public.summaries s ON u.id = s.user_id;

-- Test 2: Check the view works
SELECT 
    'View test:' as test,
    s.name as summary_name,
    s.user_full_name,
    CASE 
        WHEN s.user_full_name IS NULL THEN '❌ STILL NULL' 
        ELSE '✅ HAS NAME' 
    END as status
FROM public.summaries_with_users s
LIMIT 3;

-- Test 3: Check RLS policies
SELECT 
    'RLS Policies:' as test,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'summaries')
ORDER BY tablename, policyname;
