# Supabase Setup Guide

This guide will walk you through setting up your Supabase project for the Sikumon application.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or sign in to your account
3. Click **"New Project"**
4. Choose your organization
5. Fill in project details:
   - **Name**: `sikumon` (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose the closest region to your users
6. Click **"Create new project"**

## Step 2: Configure Authentication

1. In your Supabase dashboard, go to **Authentication > Settings**
2. Under **Site URL**, add your development URL:
   ```
   http://localhost:3000
   ```
3. Under **Redirect URLs**, add:
   ```
   http://localhost:3000/auth/callback
   ```
4. Configure **Email Templates** (optional):
   - Go to **Authentication > Email Templates**
   - Customize the confirmation and recovery email templates as needed

## Step 3: Set Up the Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **"New Query"**
3. Copy and paste the contents from `lib/schema.sql` into the editor
4. Click **"Run"** to execute the schema

This will:

- Create the `users` table with proper structure
- Set up Row Level Security (RLS) policies
- Create necessary indexes for performance
- Set up automatic triggers for user creation and updates

## Step 4: Get Your API Keys

1. Go to **Settings > API**
2. Copy the following values:
   - **Project URL** (starts with `https://...supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 5: Configure Environment Variables

1. In your Next.js project root, create/update `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```
2. Replace the placeholder values with your actual keys from Step 4

## Step 6: Verify Database Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see a `users` table with the following columns:
   - `id` (uuid, primary key)
   - `email` (text, unique)
   - `full_name` (text, nullable)
   - `grade` (text, nullable, with A-G constraint)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

## Step 7: Test User Registration

1. Start your Next.js development server:
   ```bash
   npm run dev
   ```
2. Navigate to `http://localhost:3000/auth/signup`
3. Create a test user account
4. Check your Supabase dashboard:
   - Go to **Authentication > Users** - you should see the auth user
   - Go to **Table Editor > users** - you should see the database user profile

## Step 8: Configure Row Level Security (RLS)

The schema automatically sets up RLS policies, but you can verify:

1. Go to **Authentication > Policies**
2. You should see policies for the `users` table:
   - "Users can view own profile"
   - "Users can update own profile"
   - "Users can insert own profile"
   - "Users can delete own profile"

## Step 9: Production Setup (Later)

When ready to deploy:

1. Add your production domain to **Site URL** and **Redirect URLs**
2. Update your production environment variables
3. Consider setting up email delivery (SMTP) in **Settings > Auth**

## Troubleshooting

### Common Issues:

1. **"Invalid JWT" errors**

   - Check your environment variables are correct
   - Restart your development server after changing `.env.local`

2. **RLS policy errors**

   - Ensure the schema was applied correctly
   - Check that users are properly authenticated

3. **User profile not created**
   - Check that the `handle_new_user()` trigger is working
   - Look at **Logs** in Supabase dashboard for errors

### Useful Supabase Dashboard Sections:

- **Logs**: For debugging errors
- **Database > Extensions**: Manage database extensions
- **Storage**: For file uploads (if needed later)
- **Edge Functions**: For serverless functions (if needed later)

---

🎉 **Your Supabase setup is complete!** Your Next.js app should now be able to authenticate users and store their profiles in the database.
