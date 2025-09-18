-- Migration: Create summaries table with proper RLS policies and indexes
-- Created: 2025-09-18
-- Description: Adds summaries table for file storage with public read access and authenticated CUD operations

-- Summaries table
CREATE TABLE IF NOT EXISTS public.summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_urls TEXT[] NOT NULL DEFAULT '{}',
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_edited_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security for summaries
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance on summaries
CREATE INDEX IF NOT EXISTS summaries_user_id_idx ON public.summaries(user_id);
CREATE INDEX IF NOT EXISTS summaries_upload_date_idx ON public.summaries(upload_date);
CREATE INDEX IF NOT EXISTS summaries_last_edited_at_idx ON public.summaries(last_edited_at);
CREATE INDEX IF NOT EXISTS summaries_created_at_idx ON public.summaries(created_at);
CREATE INDEX IF NOT EXISTS summaries_name_idx ON public.summaries(name);
CREATE INDEX IF NOT EXISTS summaries_file_urls_idx ON public.summaries USING GIN(file_urls);

-- RLS Policies for summaries table
-- Policy: Anyone can view summaries (public read access)
CREATE POLICY "Anyone can view summaries" ON public.summaries
  FOR SELECT USING (true);

-- Policy: Authenticated users can create summaries
CREATE POLICY "Authenticated users can create summaries" ON public.summaries
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Policy: Users can update their own summaries
CREATE POLICY "Users can update own summaries" ON public.summaries
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own summaries
CREATE POLICY "Users can delete own summaries" ON public.summaries
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update last_edited_at when summary is modified
CREATE OR REPLACE FUNCTION public.handle_summary_last_edited()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_edited_at = timezone('utc'::text, now());
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for last_edited_at (uses existing handle_updated_at for updated_at)
CREATE OR REPLACE TRIGGER summaries_updated_at
  BEFORE UPDATE ON public.summaries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for last_edited_at
CREATE OR REPLACE TRIGGER summaries_last_edited_at
  BEFORE UPDATE ON public.summaries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_summary_last_edited();

-- Grant necessary permissions
GRANT ALL ON public.summaries TO authenticated;
GRANT SELECT ON public.summaries TO anon;
