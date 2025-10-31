-- Fix hero-media storage RLS policies
-- This migration uses the service role approach to ensure bucket and policies are created correctly

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to upload hero media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete hero media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view hero media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view hero media" ON storage.objects;

-- Create comprehensive RLS policies for hero-media bucket

-- Policy 1: Allow authenticated users to upload files to hero-media bucket
CREATE POLICY "hero_media_upload_policy" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'hero-media' AND 
  (auth.jwt() ->> 'role') = 'authenticated'
);

-- Policy 2: Allow authenticated users to update files in hero-media bucket
CREATE POLICY "hero_media_update_policy" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'hero-media')
WITH CHECK (bucket_id = 'hero-media');

-- Policy 3: Allow authenticated users to delete files from hero-media bucket
CREATE POLICY "hero_media_delete_policy" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'hero-media');

-- Policy 4: Allow public users to view files in hero-media bucket
CREATE POLICY "hero_media_public_select_policy" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'hero-media');

-- Policy 5: Allow authenticated users to view files in hero-media bucket
CREATE POLICY "hero_media_auth_select_policy" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'hero-media');

-- Create storage bucket using SQL (this should work with service role)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hero-media',
  'hero-media', 
  true,
  52428800, -- 50MB limit for videos
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create RLS policy for the buckets table to allow viewing hero-media bucket
CREATE POLICY "hero_media_bucket_view_policy" ON storage.buckets
FOR SELECT TO public
USING (id = 'hero-media');

CREATE POLICY "hero_media_bucket_auth_view_policy" ON storage.buckets
FOR SELECT TO authenticated
USING (id = 'hero-media');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;