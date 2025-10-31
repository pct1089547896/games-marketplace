-- Migration: fix_storage_rls_policies
-- Created at: 1761837316

-- Fix RLS policies for both storage buckets

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete images" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload via edge function" ON storage.objects;

-- Create comprehensive RLS policies for gallery-images bucket
CREATE POLICY "gallery_images_insert_policy" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'gallery-images' 
  AND (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

CREATE POLICY "gallery_images_select_policy" ON storage.objects
FOR SELECT USING (
  bucket_id = 'gallery-images'
);

CREATE POLICY "gallery_images_update_policy" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'gallery-images'
);

CREATE POLICY "gallery_images_delete_policy" ON storage.objects
FOR DELETE USING (
  bucket_id = 'gallery-images'
);

-- Create comprehensive RLS policies for hero-media bucket
CREATE POLICY "hero_media_insert_policy" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'hero-media' 
  AND (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

CREATE POLICY "hero_media_select_policy" ON storage.objects
FOR SELECT USING (
  bucket_id = 'hero-media'
);

CREATE POLICY "hero_media_update_policy" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'hero-media'
);

CREATE POLICY "hero_media_delete_policy" ON storage.objects
FOR DELETE USING (
  bucket_id = 'hero-media'
);;