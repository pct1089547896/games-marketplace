-- Manual RLS Setup Script for Hero Media Storage
-- This script should be run in the Supabase SQL Editor with service role permissions

-- Enable RLS on storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "hero_media_upload_policy" ON storage.objects;
DROP POLICY IF EXISTS "hero_media_select_public" ON storage.objects;
DROP POLICY IF EXISTS "hero_media_select_auth" ON storage.objects;
DROP POLICY IF EXISTS "hero_media_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "hero_media_delete_policy" ON storage.objects;

-- Create comprehensive RLS policies for hero-media bucket

-- 1. Policy to allow authenticated users to upload files
CREATE POLICY "hero_media_upload_policy" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (
  bucket_id = 'hero-media' 
  AND auth.jwt() ->> 'role' = 'authenticated'
);

-- 2. Policy to allow public users to view files
CREATE POLICY "hero_media_select_public" ON storage.objects 
FOR SELECT TO public 
USING (bucket_id = 'hero-media');

-- 3. Policy to allow authenticated users to view files
CREATE POLICY "hero_media_select_auth" ON storage.objects 
FOR SELECT TO authenticated 
USING (bucket_id = 'hero-media');

-- 4. Policy to allow authenticated users to update files
CREATE POLICY "hero_media_update_policy" ON storage.objects 
FOR UPDATE TO authenticated 
USING (bucket_id = 'hero-media')
WITH CHECK (bucket_id = 'hero-media');

-- 5. Policy to allow authenticated users to delete files
CREATE POLICY "hero_media_delete_policy" ON storage.objects 
FOR DELETE TO authenticated 
USING (bucket_id = 'hero-media');

-- Grant necessary permissions to authenticated role
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- Ensure the hero-media bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hero-media',
  'hero-media', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Grant permissions to view bucket
CREATE POLICY "hero_media_bucket_view_public" ON storage.buckets
FOR SELECT TO public
USING (id = 'hero-media');

CREATE POLICY "hero_media_bucket_view_auth" ON storage.buckets
FOR SELECT TO authenticated
USING (id = 'hero-media');

-- Verification query
SELECT 
  'RLS policies created successfully' as status,
  count(*) as policies_count
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage' 
AND policyname LIKE 'hero_media_%';