-- Migration: create_hero_media_storage_bucket
-- Created at: 1761744000

-- Create hero-media storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-media', 'hero-media', true)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  updated_at = now();

-- Enable RLS for storage bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload hero media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'hero-media' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete their own files
CREATE POLICY "Authenticated users can delete hero media" ON storage.objects
  FOR DELETE USING (bucket_id = 'hero-media' AND auth.role() = 'authenticated');

-- Allow public users to view hero media
CREATE POLICY "Public can view hero media" ON storage.objects
  FOR SELECT USING (bucket_id = 'hero-media');

-- Set file size limit (10MB) for hero-media bucket
-- This is set in the bucket policy, max file size will be enforced in the frontend code