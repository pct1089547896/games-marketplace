-- Migration: create_hero_customization_system
-- Created at: 1761743722

-- Hero settings table
CREATE TABLE IF NOT EXISTS hero_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active boolean DEFAULT false,
  title text NOT NULL,
  subtitle text,
  cta_text text,
  cta_link text,
  secondary_cta_text text,
  secondary_cta_link text,
  layout_template text DEFAULT 'centered',
  background_type text DEFAULT 'image',
  background_media_url text,
  background_color text DEFAULT '#000000',
  background_gradient text,
  text_position text DEFAULT 'center',
  text_color text DEFAULT '#ffffff',
  featured_content_ids text[],
  display_featured_content boolean DEFAULT true,
  featured_content_layout text DEFAULT 'carousel',
  seo_title text,
  seo_description text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Hero media library
CREATE TABLE IF NOT EXISTS hero_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  url text NOT NULL,
  type text NOT NULL,
  alt_text text,
  file_size bigint,
  dimensions text,
  created_at timestamp DEFAULT now()
);

-- Enable RLS
ALTER TABLE hero_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_media ENABLE ROW LEVEL SECURITY;

-- Allow public read of active hero settings
CREATE POLICY "Public can view active hero settings" ON hero_settings
  FOR SELECT USING (is_active = true);

-- Allow authenticated users full access (for admin)
CREATE POLICY "Authenticated users can manage hero settings" ON hero_settings
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Authenticated users can manage hero media" ON hero_media
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Allow anonymous users to read hero media
CREATE POLICY "Public can view hero media" ON hero_media
  FOR SELECT USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_hero_settings_active ON hero_settings(is_active);
CREATE INDEX IF NOT EXISTS idx_hero_media_type ON hero_media(type);

-- Insert default hero setting
INSERT INTO hero_settings (
  is_active,
  title,
  subtitle,
  cta_text,
  cta_link,
  secondary_cta_text,
  secondary_cta_link,
  layout_template,
  background_type,
  background_color,
  background_gradient,
  text_position,
  text_color,
  display_featured_content,
  featured_content_layout
) VALUES (
  true,
  'Your Ultimate Free Gaming Hub',
  'Discover amazing free games and programs - Download, Play, Enjoy!',
  'Browse Games',
  '/games',
  'View Programs',
  '/programs',
  'centered',
  'gradient',
  '#000000',
  'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%)',
  'center',
  '#ffffff',
  true,
  'carousel'
);;