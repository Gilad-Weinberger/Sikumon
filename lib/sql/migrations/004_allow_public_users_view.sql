-- Update RLS policy for users table to allow everyone (including anonymous users) to view users
-- This removes authentication requirements for viewing user profiles

-- Drop the existing policies that require authentication
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view basic info of other users" ON public.users;

-- Create a single policy that allows anyone to view users (public read access)
-- This includes anonymous users and authenticated users
CREATE POLICY "Anyone can view users" ON public.users
FOR SELECT USING (true);

-- Keep the existing policies for other operations (insert, update, delete)
-- These still require authentication and ownership

-- Grant SELECT permission to anonymous users for the users table
GRANT SELECT ON public.users TO anon;

-- Note: This allows public access to user profiles including:
-- - id, email, full_name, grade, created_at, updated_at
-- If you need to restrict certain fields, implement filtering in application logic
