# Supabase Update Scripts

This directory contains scripts to update your Supabase configuration.

## Update Storage Bucket MIME Types

### Purpose

Updates the Supabase storage bucket to allow all file types supported by the application, including:

- PDF files (.pdf)
- Word documents (.doc, .docx)
- Images (.jpg, .jpeg, .png, .gif, .svg, .webp, .bmp, .ico)

### Prerequisites

1. Node.js installed
2. Environment variables set in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Usage

#### Option 1: Run the Node.js Script (Recommended)

```bash
# Install dependencies if needed
npm install @supabase/supabase-js dotenv

# Run the update script
node scripts/update-supabase-bucket.js
```

#### Option 2: Manual SQL Update

If the script fails, you can manually run the SQL in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the contents of `lib/sql/storage/update_summaries_bucket_mime_types.sql`

### What the Script Does

1. Connects to your Supabase project using the service role key
2. Updates the `summaries` storage bucket to allow all supported MIME types
3. Verifies the update was successful
4. Displays the current bucket configuration

### Troubleshooting

- **Missing environment variables**: Ensure your `.env.local` file contains the required Supabase credentials
- **Permission errors**: Make sure you're using the service role key, not the anon key
- **Network issues**: Check your internet connection and Supabase project status

### Security Note

The service role key has admin privileges. Never commit it to version control or share it publicly.
