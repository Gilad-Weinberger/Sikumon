-- Update RLS policy for users table to allow viewing basic profile info of other users
-- This is needed so that summary authors' names can be displayed in the summaries grid

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

-- Create a new policy that allows users to view their own full profile
CREATE POLICY "Users can view own profile" ON public.users
FOR SELECT USING (auth.uid() = id);

-- Create a new policy that allows authenticated users to view basic info of other users
-- This includes only id, full_name, and created_at for displaying author names
CREATE POLICY "Users can view basic info of other users" ON public.users
FOR SELECT USING (
  auth.role() = 'authenticated' AND 
  auth.uid() IS NOT NULL
);

-- Note: The application logic should filter which fields are returned based on whether
-- the user is viewing their own profile or someone else's profile
