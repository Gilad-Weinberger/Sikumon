-- Enable Row Level Security extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  grade TEXT CHECK (grade IN ('A', 'B', 'C', 'D', 'E', 'F', 'G')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_created_at_idx ON public.users(created_at);
CREATE INDEX IF NOT EXISTS users_grade_idx ON public.users(grade);

-- RLS Policies for users table
-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete own profile" ON public.users
  FOR DELETE USING (auth.uid() = id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update updated_at
CREATE OR REPLACE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

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

-- Trigger to automatically update updated_at and last_edited_at for summaries
CREATE OR REPLACE TRIGGER summaries_updated_at
  BEFORE UPDATE ON public.summaries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to update last_edited_at when summary is modified
CREATE OR REPLACE FUNCTION public.handle_summary_last_edited()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_edited_at = timezone('utc'::text, now());
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for last_edited_at
CREATE OR REPLACE TRIGGER summaries_last_edited_at
  BEFORE UPDATE ON public.summaries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_summary_last_edited();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.summaries TO authenticated;
GRANT SELECT ON public.summaries TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
