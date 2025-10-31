-- Migration: add_advanced_hero_customization
-- Created at: 1761772567

-- Add animation controls
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS animation_type TEXT DEFAULT 'fade';
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS animation_duration INTEGER DEFAULT 1000;
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS animation_delay INTEGER DEFAULT 0;
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS scroll_animation BOOLEAN DEFAULT false;

-- Add advanced typography
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'Inter';
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS title_font_size INTEGER DEFAULT 48;
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS subtitle_font_size INTEGER DEFAULT 20;
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS font_weight INTEGER DEFAULT 700;
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS line_height DECIMAL DEFAULT 1.2;
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS letter_spacing DECIMAL DEFAULT 0;
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS text_shadow TEXT DEFAULT 'none';

-- Add custom color system (extend existing)
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#3b82f6';
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS gradient_type TEXT DEFAULT 'linear';
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS gradient_angle INTEGER DEFAULT 135;
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS gradient_colors JSONB DEFAULT '["#000000", "#1a1a1a"]'::jsonb;

-- Add overlay & effects
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS overlay_type TEXT DEFAULT 'none';
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS overlay_color TEXT DEFAULT 'rgba(0,0,0,0.4)';
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS overlay_opacity DECIMAL DEFAULT 0.4;
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS image_filter TEXT DEFAULT 'none';
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS blur_amount INTEGER DEFAULT 0;
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS brightness INTEGER DEFAULT 100;
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS contrast INTEGER DEFAULT 100;
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS pattern_overlay TEXT DEFAULT 'none';

-- Add button styling
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS button_style TEXT DEFAULT 'solid';
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS button_hover_effect TEXT DEFAULT 'scale';
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS button_size TEXT DEFAULT 'medium';
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS button_gradient BOOLEAN DEFAULT false;
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS button_shadow TEXT DEFAULT '0 4px 6px rgba(0,0,0,0.1)';

-- Add responsive design
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS mobile_layout TEXT DEFAULT 'stack';
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS tablet_layout TEXT DEFAULT 'adapt';
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS mobile_font_size INTEGER DEFAULT 32;
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS tablet_font_size INTEGER DEFAULT 40;
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS hide_on_mobile BOOLEAN DEFAULT false;

-- Add advanced options
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS custom_css TEXT DEFAULT '';
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS preset_theme TEXT DEFAULT 'custom';
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS padding_top INTEGER DEFAULT 120;
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS padding_bottom INTEGER DEFAULT 120;
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS content_max_width INTEGER DEFAULT 1200;

COMMENT ON TABLE hero_settings IS 'Hero section settings with comprehensive customization options including animations, typography, colors, overlays, button styling, responsive design, and advanced controls';;