-- Create post_images table for gallery system
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

-- Add gallery_theme and gallery_layout columns to existing tables
ALTER TABLE public.games 
ADD COLUMN IF NOT EXISTS gallery_theme TEXT DEFAULT 'grid',
ADD COLUMN IF NOT EXISTS gallery_layout TEXT DEFAULT 'grid';

ALTER TABLE public.programs 
ADD COLUMN IF NOT EXISTS gallery_theme TEXT DEFAULT 'grid',
ADD COLUMN IF NOT EXISTS gallery_layout TEXT DEFAULT 'grid';

ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS gallery_theme TEXT DEFAULT 'grid',
ADD COLUMN IF NOT EXISTS gallery_layout TEXT DEFAULT 'grid';

-- Create updated_at trigger for post_images
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_images_updated_at
  BEFORE UPDATE ON public.post_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE public.post_images IS 'Stores multiple images for games, programs, and blog posts';
COMMENT ON COLUMN public.post_images.post_type IS 'Type of content: game, program, or blog';
COMMENT ON COLUMN public.post_images.display_order IS 'Order for displaying images in gallery';
COMMENT ON COLUMN public.post_images.thumbnail_url IS 'Optional thumbnail version of image';
