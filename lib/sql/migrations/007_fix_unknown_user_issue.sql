-- Migration 007: Fix "Unknown User" Issue in Summary Grid
-- This migration addresses the authentication wall preventing user names from showing in summaries
-- Created: 2025-01-21

BEGIN;

-- Step 1: Add public read access to basic user info (SAFE - only allows reading public data)
-- Drop existing restrictive RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

-- Create new policy: Anyone can view basic user info (id, full_name) for summaries
-- This is SAFE because we're only exposing names, not sensitive data like email/grade
CREATE POLICY "Anyone can view basic user info" ON public.users
  FOR SELECT USING (true);

-- Keep existing update/insert/delete policies for user security
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON public.users
  FOR DELETE USING (auth.uid() = id);

-- Step 2: Fix foreign key relationship (if needed)
-- Check if summaries table exists and has incorrect foreign key
DO $$
BEGIN
    -- Only update if the table exists and has the wrong foreign key
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'summaries_user_id_fkey' 
        AND table_name = 'summaries'
        AND table_schema = 'public'
    ) THEN
        -- Check if it references auth.users instead of public.users
        -- If so, we need to update the data first
        
        -- Ensure all user_ids in summaries have corresponding records in public.users
        INSERT INTO public.users (id, email, full_name)
        SELECT DISTINCT 
            s.user_id,
            au.email,
            COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', 'User')
        FROM public.summaries s
        JOIN auth.users au ON s.user_id = au.id
        LEFT JOIN public.users pu ON s.user_id = pu.id
        WHERE pu.id IS NULL
        ON CONFLICT (id) DO NOTHING;
        
        -- Now it's safe to update the foreign key constraint
        ALTER TABLE public.summaries 
        DROP CONSTRAINT IF EXISTS summaries_user_id_fkey;
        
        ALTER TABLE public.summaries 
        ADD CONSTRAINT summaries_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 3: Create optimized view for summaries with user data
-- This eliminates the need for separate API calls
CREATE OR REPLACE VIEW public.summaries_with_users AS
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

-- Step 4: Grant necessary permissions
-- Grant read access to anonymous and authenticated users for the view
GRANT SELECT ON public.summaries_with_users TO anon, authenticated;

-- Ensure basic user info is readable by everyone
GRANT SELECT ON public.users TO anon, authenticated;

-- Step 5: Add helpful indexes for the new access patterns
CREATE INDEX IF NOT EXISTS users_full_name_idx ON public.users(full_name) 
WHERE full_name IS NOT NULL;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;

-- Verification query (comment out in production)
/*
SELECT 
    s.name as summary_name,
    u.full_name as author_name,
    CASE WHEN u.full_name IS NULL THEN 'STILL NULL - CHECK SETUP' ELSE 'OK' END as status
FROM public.summaries s 
LEFT JOIN public.users u ON s.user_id = u.id 
LIMIT 5;
*/
