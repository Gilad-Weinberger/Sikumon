-- Storage Bucket Setup for Summaries
-- Created: 2025-09-18
-- Description: Creates summaries storage bucket with proper RLS policies

-- Create the summaries bucket (public read, authenticated CUD)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'summaries', 
  'summaries', 
  true,  -- Public read access
  52428800,  -- 50MB file size limit
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/svg+xml',
    'image/webp'
  ]
) ON CONFLICT (id) DO NOTHING;

-- RLS Policies for summaries storage bucket

-- Policy: Allow public read access to summaries files
CREATE POLICY "Public read access to summaries" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'summaries');

-- Policy: Allow authenticated users to upload files to summaries bucket
CREATE POLICY "Authenticated users can upload to summaries" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'summaries' AND 
    auth.uid() IS NOT NULL
  );

-- Policy: Allow users to update their own uploaded files
CREATE POLICY "Users can update their own summaries files" ON storage.objects
  FOR UPDATE 
  USING (
    bucket_id = 'summaries' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Allow users to delete their own uploaded files
CREATE POLICY "Users can delete their own summaries files" ON storage.objects
  FOR DELETE 
  USING (
    bucket_id = 'summaries' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create helper function to organize files by user
CREATE OR REPLACE FUNCTION public.get_user_summary_path(file_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN auth.uid()::text || '/' || extract(year from now()) || '/' || extract(month from now()) || '/' || file_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions for storage operations
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;
