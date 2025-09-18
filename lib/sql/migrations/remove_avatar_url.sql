-- Migration: Remove avatar_url column from users table
-- Date: 2025-01-18
-- Description: Remove the avatar_url column as it's no longer needed

BEGIN;

-- Remove the avatar_url column from the users table
ALTER TABLE public.users 
DROP COLUMN IF EXISTS avatar_url;

-- Update the updated_at timestamp for this schema change
-- (This is just a marker for when the migration was applied)
COMMENT ON TABLE public.users IS 'Users table - avatar_url column removed on 2025-01-18';

COMMIT;
