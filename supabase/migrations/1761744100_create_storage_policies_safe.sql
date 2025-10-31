-- Create hero-media storage bucket (Safe Method)
-- Use Supabase Storage API instead of direct table access

-- Step 1: Create the bucket using Storage API (will be done through frontend/admin)
-- Step 2: Set up RLS policies using proper storage methods

-- Alternative approach - Create bucket and policies using service role
-- Note: This should be executed in Supabase SQL Editor with service role permissions

-- First, ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to upload to hero-media bucket
CREATE POLICY "Allow authenticated users to upload hero media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'hero-media');

-- Create policy for authenticated users to delete from hero-media bucket
CREATE POLICY "Allow authenticated users to delete hero media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'hero-media');

-- Create policy for public users to view hero media
CREATE POLICY "Allow public to view hero media" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'hero-media');

-- Create policy for authenticated users to view hero media
CREATE POLICY "Allow authenticated users to view hero media" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'hero-media');