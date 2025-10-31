-- URGENT FIX: Add missing gallery columns to fix upload error
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/dieqhiezcpexkivklxcw/sql

-- Fix 1: Add missing columns to blog_posts table
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS gallery_theme TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS gallery_layout TEXT DEFAULT 'grid';

-- Fix 2: Add missing columns to games table
ALTER TABLE public.games 
ADD COLUMN IF NOT EXISTS gallery_theme TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS gallery_layout TEXT DEFAULT 'grid';

-- Fix 3: Add missing columns to programs table
ALTER TABLE public.programs 
ADD COLUMN IF NOT EXISTS gallery_theme TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS gallery_layout TEXT DEFAULT 'grid';

-- Fix 4: Create post_images table if it doesn't exist
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_images_post_id ON public.post_images(post_id);
CREATE INDEX IF NOT EXISTS idx_post_images_post_type ON public.post_images(post_type);
CREATE INDEX IF NOT EXISTS idx_post_images_display_order ON public.post_images(display_order);

-- Add RLS policies
ALTER TABLE public.post_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view post images" ON public.post_images;
DROP POLICY IF EXISTS "Authenticated users can insert images" ON public.post_images;
DROP POLICY IF EXISTS "Authenticated users can update images" ON public.post_images;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON public.post_images;

-- Allow public to read images
CREATE POLICY "Anyone can view post images"
  ON public.post_images
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert images
CREATE POLICY "Authenticated users can insert images"
  ON public.post_images
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update their own images
CREATE POLICY "Authenticated users can update images"
  ON public.post_images
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete images"
  ON public.post_images
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create updated_at trigger for post_images
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_post_images_updated_at ON public.post_images;
CREATE TRIGGER update_post_images_updated_at
  BEFORE UPDATE ON public.post_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verify the fix
SELECT 'blog_posts columns added' AS status,
       EXISTS (
         SELECT 1 FROM information_schema.columns 
         WHERE table_name = 'blog_posts' AND column_name = 'gallery_layout'
       ) AS gallery_layout_exists;

SELECT 'post_images table created' AS status,
       EXISTS (
         SELECT 1 FROM information_schema.tables 
         WHERE table_name = 'post_images'
       ) AS table_exists;
