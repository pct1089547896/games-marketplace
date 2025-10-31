-- Migration: add_missing_hero_columns
-- Created at: 1761743776

-- Add missing columns to hero_settings
ALTER TABLE hero_settings 
  ADD COLUMN IF NOT EXISTS background_gradient text,
  ADD COLUMN IF NOT EXISTS text_color text DEFAULT '#ffffff',
  ADD COLUMN IF NOT EXISTS display_featured_content boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS featured_content_layout text DEFAULT 'carousel',
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text;

-- Insert default hero setting if none exists
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
)
SELECT
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
WHERE NOT EXISTS (SELECT 1 FROM hero_settings);;