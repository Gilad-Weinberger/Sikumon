# Database Migrations

This directory contains SQL migration scripts to update your database schema.

## How to Apply Migrations

### Remove Avatar URL Migration

**File:** `remove_avatar_url.sql`  
**Date:** 2025-01-18

This migration removes the `avatar_url` column from the `users` table as it's no longer needed.

**To apply this migration:**

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Click **"New Query"**
4. Copy and paste the contents of `remove_avatar_url.sql`
5. Click **"Run"** to execute the migration

**What this migration does:**

- Removes the `avatar_url` column from the `public.users` table
- Adds a comment to track when the migration was applied
- Uses transaction safety with `BEGIN`/`COMMIT`

**Note:** This migration is safe to run multiple times due to the `IF EXISTS` clause.

## Migration History

- `remove_avatar_url.sql` - Removes avatar_url column (2025-01-18)
