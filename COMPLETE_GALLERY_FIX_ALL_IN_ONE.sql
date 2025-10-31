-- ============================================================================
-- COMPLETE GALLERY SYSTEM FIX - ALL-IN-ONE SCRIPT
-- Run this ONCE in Supabase SQL Editor if you haven't already
-- URL: https://supabase.com/dashboard/project/dieqhiezcpexkivklxcw/sql
-- ============================================================================

-- PART 1: DATABASE SCHEMA (Safe to re-run, uses IF NOT EXISTS)
-- ============================================================================

-- Add gallery columns to blog_posts
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS gallery_theme TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS gallery_layout TEXT DEFAULT 'grid';

-- Add gallery columns to games
ALTER TABLE public.games 
ADD COLUMN IF NOT EXISTS gallery_theme TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS gallery_layout TEXT DEFAULT 'grid';

-- Add gallery columns to programs
ALTER TABLE public.programs 
ADD COLUMN IF NOT EXISTS gallery_theme TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS gallery_layout TEXT DEFAULT 'grid';

-- Create post_images table
CREATE TABLE IF NOT EXISTS public.post_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  post_type TEXT NOT NULL CHECK (post_type IN ('game', 'program', 'blog')),
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  alt_text TEXT,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_post_images_post_id ON public.post_images(post_id);
CREATE INDEX IF NOT EXISTS idx_post_images_post_type ON public.post_images(post_type);
CREATE INDEX IF NOT EXISTS idx_post_images_display_order ON public.post_images(display_order);

-- Enable RLS on post_images
ALTER TABLE public.post_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for post_images table
DROP POLICY IF EXISTS "Anyone can view post images" ON public.post_images;
DROP POLICY IF EXISTS "Authenticated users can insert images" ON public.post_images;
DROP POLICY IF EXISTS "Authenticated users can update images" ON public.post_images;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON public.post_images;

CREATE POLICY "Anyone can view post images"
  ON public.post_images
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert images"
  ON public.post_images
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Authenticated users can update images"
  ON public.post_images
  FOR UPDATE
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Authenticated users can delete images"
  ON public.post_images
  FOR DELETE
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_post_images_updated_at ON public.post_images;
CREATE TRIGGER update_post_images_updated_at
  BEFORE UPDATE ON public.post_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- PART 2: STORAGE RLS POLICIES
-- ============================================================================
-- NOTE: You must create the 'gallery-images' bucket FIRST via the Storage UI!
-- Go to: Storage > Create bucket > Name: "gallery-images" > Public: ON > Size: 10MB
-- ============================================================================

-- Drop existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "Public read access for gallery-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload via edge function" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- Create new storage policies
-- Policy 1: Public can read/view images
CREATE POLICY "Public read access for gallery-images" 
ON storage.objects
FOR SELECT 
USING (bucket_id = 'gallery-images');

-- Policy 2: Allow uploads (CRITICAL - must include 'anon' role!)
CREATE POLICY "Allow upload via edge function" 
ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'gallery-images'
  AND (
    auth.role() = 'anon' 
    OR auth.role() = 'authenticated'
    OR auth.role() = 'service_role'
  )
);

-- Policy 3: Allow updates
CREATE POLICY "Authenticated users can update gallery images" 
ON storage.objects
FOR UPDATE 
USING (
  bucket_id = 'gallery-images'
  AND (
    auth.role() = 'authenticated'
    OR auth.role() = 'service_role'
  )
);

-- Policy 4: Allow deletes
CREATE POLICY "Authenticated users can delete gallery images" 
ON storage.objects
FOR DELETE 
USING (
  bucket_id = 'gallery-images'
  AND (
    auth.role() = 'authenticated'
    OR auth.role() = 'service_role'
  )
);


-- PART 3: VERIFICATION QUERIES
-- ============================================================================

-- Check that all columns exist
SELECT 
  'blog_posts columns' AS check_name,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'gallery_layout'
  ) AS gallery_layout_exists,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'gallery_theme'
  ) AS gallery_theme_exists;

-- Check that post_images table exists
SELECT 
  'post_images table' AS check_name,
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'post_images'
  ) AS table_exists;

-- Check storage policies
SELECT 
  'Storage policies for gallery-images' AS check_name,
  COUNT(*) AS policy_count
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%gallery-images%';

-- Expected results:
-- 1. gallery_layout_exists: true, gallery_theme_exists: true
-- 2. table_exists: true
-- 3. policy_count: 4 (if bucket exists and policies were created)

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- If all checks pass, your gallery system is ready.
-- 
-- MANUAL STEP REQUIRED:
-- Create the storage bucket via Supabase Dashboard:
-- 1. Go to: https://supabase.com/dashboard/project/dieqhiezcpexkivklxcw/storage/buckets
-- 2. Click "Create bucket"
-- 3. Name: gallery-images
-- 4. Public: ON (toggle to enable)
-- 5. File size limit: 10485760 (10MB)
-- 6. Click "Create bucket"
-- 
-- Then re-run this script to apply the storage policies.
-- ============================================================================
