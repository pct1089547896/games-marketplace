-- Migration: create_theme_management_tables
-- Created at: 1761882165

-- Theme Management System Migration
-- Creates tables for storing theme configurations and active theme selection

-- Table: themes
-- Stores theme configurations with CSS variables
CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- gaming, holiday, seasonal, style, industry, color, special
  
  -- CSS Variables stored as JSONB for flexibility
  -- Structure: { "primary": "#hex", "secondary": "#hex", "background": "#hex", etc. }
  css_variables JSONB NOT NULL,
  
  -- Additional theme properties
  is_preset BOOLEAN DEFAULT true, -- true for built-in themes, false for custom
  is_active BOOLEAN DEFAULT false,
  preview_image_url TEXT, -- optional preview image
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: active_theme
-- Stores the currently active theme (single row table)
CREATE TABLE IF NOT EXISTS active_theme (
  id INTEGER PRIMARY KEY DEFAULT 1,
  theme_id UUID REFERENCES themes(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default row for active_theme (will be updated after themes are inserted)
INSERT INTO active_theme (id, theme_id) VALUES (1, NULL)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_themes_category ON themes(category);
CREATE INDEX IF NOT EXISTS idx_themes_is_preset ON themes(is_preset);
CREATE INDEX IF NOT EXISTS idx_themes_is_active ON themes(is_active);
CREATE INDEX IF NOT EXISTS idx_themes_name ON themes(name);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_theme_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for themes table
DROP TRIGGER IF EXISTS themes_updated_at ON themes;
CREATE TRIGGER themes_updated_at
  BEFORE UPDATE ON themes
  FOR EACH ROW
  EXECUTE FUNCTION update_theme_updated_at();

-- Trigger for active_theme table
DROP TRIGGER IF EXISTS active_theme_updated_at ON active_theme;
CREATE TRIGGER active_theme_updated_at
  BEFORE UPDATE ON active_theme
  FOR EACH ROW
  EXECUTE FUNCTION update_theme_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_theme ENABLE ROW LEVEL SECURITY;

-- RLS Policies for themes table
-- Anyone can read themes
CREATE POLICY "Anyone can view themes"
  ON themes FOR SELECT
  USING (true);

-- Only admins can insert/update/delete themes (for now, we'll allow all authenticated users)
CREATE POLICY "Authenticated users can insert themes"
  ON themes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update themes"
  ON themes FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete themes"
  ON themes FOR DELETE
  USING (auth.role() = 'authenticated');

-- RLS Policies for active_theme table
-- Anyone can read active theme
CREATE POLICY "Anyone can view active theme"
  ON active_theme FOR SELECT
  USING (true);

-- Only authenticated users can update active theme
CREATE POLICY "Authenticated users can update active theme"
  ON active_theme FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Comments for documentation
COMMENT ON TABLE themes IS 'Stores theme configurations with CSS variables for the marketplace';
COMMENT ON TABLE active_theme IS 'Stores the currently active theme (single row table)';
COMMENT ON COLUMN themes.css_variables IS 'JSONB object containing CSS variable key-value pairs';
COMMENT ON COLUMN themes.is_preset IS 'True for built-in themes, false for user-created custom themes';

-- ==============================================================================
-- AUTO-LOAD THEME PRESETS
-- ==============================================================================
-- This section automatically seeds all 31 preset themes into the database
-- No manual import step required - themes are ready to use immediately!

-- Theme 1: Gamer Razer
INSERT INTO themes (name, display_name, description, category, css_variables, is_preset)
VALUES (
  'gamer-razer',
  'Gamer Razer',
  'Iconic gaming aesthetic with green accents',
  'gaming',
  '{"primary":"#00ff00","primaryHover":"#00cc00","secondary":"#1a1a1a","background":"#0a0a0a","backgroundAlt":"#1a1a1a","text":"#ffffff","textMuted":"#a0a0a0","border":"#00ff00","success":"#00ff00","warning":"#ffcc00","error":"#ff0044","info":"#00aaff"}'::jsonb,
  true
);

-- Theme 2: Cyberpunk
INSERT INTO themes (name, display_name, description, category, css_variables, is_preset)
VALUES (
  'cyberpunk',
  'Cyberpunk',
  'Neon-soaked dystopian future aesthetic',
  'gaming',
  '{"primary":"#ff00ff","primaryHover":"#cc00cc","secondary":"#00ffff","background":"#0a0014","backgroundAlt":"#1a0028","text":"#ffffff","textMuted":"#aa88cc","border":"#ff00ff","success":"#00ff88","warning":"#ffaa00","error":"#ff0066","info":"#00ccff"}'::jsonb,
  true
);

-- Theme 3: Retro Arcade
INSERT INTO themes (name, display_name, description, category, css_variables, is_preset)
VALUES (
  'retro-arcade',
  'Retro Arcade',
  'Classic 80s arcade nostalgia',
  'gaming',
  '{"primary":"#ff6b35","primaryHover":"#e65a2f","secondary":"#f7931e","background":"#1a1a2e","backgroundAlt":"#16213e","text":"#ffffff","textMuted":"#a0a0a0","border":"#ff6b35","success":"#4ecdc4","warning":"#f7931e","error":"#ff1744","info":"#00bcd4"}'::jsonb,
  true
);

-- Theme 4: Neon Gaming
INSERT INTO themes (name, display_name, description, category, css_variables, is_preset)
VALUES (
  'neon-gaming',
  'Neon Gaming',
  'Vibrant neon lights gaming atmosphere',
  'gaming',
  '{"primary":"#00ff88","primaryHover":"#00dd77","secondary":"#ff00aa","background":"#0d0d1a","backgroundAlt":"#1a1a2e","text":"#ffffff","textMuted":"#b0b0c0","border":"#00ff88","success":"#00ff88","warning":"#ffbb00","error":"#ff0066","info":"#00aaff"}'::jsonb,
  true
);

-- Theme 5: Halloween Spooky
INSERT INTO themes (name, display_name, description, category, css_variables, is_preset)
VALUES (
  'halloween-spooky',
  'Halloween Spooky',
  'Dark and mysterious Halloween vibes',
  'holiday',
  '{"primary":"#ff6b00","primaryHover":"#e65a00","secondary":"#8b00ff","background":"#1a0f0f","backgroundAlt":"#2a1515","text":"#ffffff","textMuted":"#b0a0a0","border":"#ff6b00","success":"#00ff66","warning":"#ffaa00","error":"#ff0000","info":"#8b00ff"}'::jsonb,
  true
);

-- Theme 6: Christmas Cheer
INSERT INTO themes (name, display_name, description, category, css_variables, is_preset)
VALUES (
  'christmas-cheer',
  'Christmas Cheer',
  'Festive red and green holiday spirit',
  'holiday',
  '{"primary":"#c41e3a","primaryHover":"#a01828","secondary":"#0f8558","background":"#f5f5f0","backgroundAlt":"#ffffff","text":"#2d3436","textMuted":"#636e72","border":"#c41e3a","success":"#0f8558","warning":"#f39c12","error":"#e74c3c","info":"#3498db"}'::jsonb,
  true
);

-- Theme 7: New Year Sparkle
INSERT INTO themes (name, display_name, description, category, css_variables, is_preset)
VALUES (
  'new-year-sparkle',
  'New Year Sparkle',
  'Glittering gold and silver celebration',
  'holiday',
  '{"primary":"#ffd700","primaryHover":"#e6c200","secondary":"#c0c0c0","background":"#0f0f1a","backgroundAlt":"#1a1a2e","text":"#ffffff","textMuted":"#b0b0c0","border":"#ffd700","success":"#00ff88","warning":"#ffaa00","error":"#ff4466","info":"#00aaff"}'::jsonb,
  true
);

-- Theme 8: Thanksgiving Harvest
INSERT INTO themes (name, display_name, description, category, css_variables, is_preset)
VALUES (
  'thanksgiving-harvest',
  'Thanksgiving Harvest',
  'Warm autumn harvest colors',
  'holiday',
  '{"primary":"#d2691e","primaryHover":"#b85a18","secondary":"#cd853f","background":"#2c1810","backgroundAlt":"#3d2418","text":"#f5deb3","textMuted":"#d2b48c","border":"#d2691e","success":"#6b8e23","warning":"#ff8c00","error":"#dc143c","info":"#4682b4"}'::jsonb,
  true
);

-- Theme 9: Spring Floral
INSERT INTO themes (name, display_name, description, category, css_variables, is_preset)
VALUES (
  'spring-floral',
  'Spring Floral',
  'Fresh blooming spring garden',
  'seasonal',
  '{"primary":"#ff69b4","primaryHover":"#e55ba0","secondary":"#98d8c8","background":"#fff5f7","backgroundAlt":"#ffffff","text":"#2d3436","textMuted":"#636e72","border":"#ff69b4","success":"#6dd5b1","warning":"#fdcb6e","error":"#e74c3c","info":"#74b9ff"}'::jsonb,
  true
);

-- Theme 10: Summer Beach
INSERT INTO themes (name, display_name, description, category, css_variables, is_preset)
VALUES (
  'summer-beach',
  'Summer Beach',
  'Bright sunny beach vibes',
  'seasonal',
  '{"primary":"#00bfff","primaryHover":"#00a0e6","secondary":"#ffd700","background":"#f0f8ff","backgroundAlt":"#ffffff","text":"#2d3436","textMuted":"#636e72","border":"#00bfff","success":"#00cc88","warning":"#ffa500","error":"#ff6b6b","info":"#1e90ff"}'::jsonb,
  true
);

-- Theme 11: Autumn Nature
INSERT INTO themes (name, display_name, description, category, css_variables, is_preset)
VALUES (
  'autumn-nature',
  'Autumn Nature',
  'Warm fall foliage colors',
  'seasonal',
  '{"primary":"#d2691e","primaryHover":"#b85a18","secondary":"#8b4513","background":"#faf0e6","backgroundAlt":"#ffffff","text":"#3e2723","textMuted":"#795548","border":"#d2691e","success":"#689f38","warning":"#ff8f00","error":"#d32f2f","info":"#5d4037"}'::jsonb,
  true
);

-- Theme 12: Winter Snow
INSERT INTO themes (name, display_name, description, category, css_variables, is_preset)
VALUES (
  'winter-snow',
  'Winter Snow',
  'Cool crisp winter wonderland',
  'seasonal',
  '{"primary":"#4a90e2","primaryHover":"#3a7bc8","secondary":"#87ceeb","background":"#f0f4f8","backgroundAlt":"#ffffff","text":"#2c3e50","textMuted":"#7f8c8d","border":"#4a90e2","success":"#27ae60","warning":"#f39c12","error":"#e74c3c","info":"#3498db"}'::jsonb,
  true
);

-- Theme 13: Minimalist Clean (DEFAULT THEME)
INSERT INTO themes (name, display_name, description, category, css_variables, is_preset, is_active)
VALUES (
  'minimalist-clean',
  'Minimalist Clean',
  'Pure minimalist design with maximum clarity',
  'style',
  '{"primary":"#000000","primaryHover":"#1a1a1a","secondary":"#666666","background":"#ffffff","backgroundAlt":"#f5f5f5","text":"#000000","textMuted":"#666666","border":"#e0e0e0","success":"#00aa00","warning":"#ff9900","error":"#dd0000","info":"#0066cc"}'::jsonb,
  true,
  true
);

-- Theme 14: Glass Morphism
INSERT INTO themes (name, display_name, description, category, css_variables, is_preset)
VALUES (
  'glass-morphism',
  'Glass Morphism',
  'Modern frosted glass effect',
  'style',
  '{"primary":"#4a90e2","primaryHover":"#3a7bc8","secondary":"#7b68ee","background":"#f0f4f8","backgroundAlt":"rgba(255, 255, 255, 0.7)","text":"#2c3e50","textMuted":"#7f8c8d","border":"rgba(74, 144, 226, 0.3)","success":"#27ae60","warning":"#f39c12","error":"#e74c3c","info":"#3498db"}'::jsonb,
  true
);

-- Theme 15: Neon Glow
INSERT INTO themes (name, display_name, description, category, css_variables, is_preset)
VALUES (
  'neon-glow',
  'Neon Glow',
  'Vibrant glowing neon aesthetic',
  'style',
  '{"primary":"#ff00ff","primaryHover":"#cc00cc","secondary":"#00ffff","background":"#0a0a0a","backgroundAlt":"#1a1a1a","text":"#ffffff","textMuted":"#b0b0b0","border":"#ff00ff","success":"#00ff88","warning":"#ffbb00","error":"#ff0066","info":"#00ccff"}'::jsonb,
  true
);

-- Theme 16: Gradient Pro
INSERT INTO themes (name, display_name, description, category, css_variables, is_preset)
VALUES (
  'gradient-pro',
  'Gradient Pro',
  'Smooth professional gradients',
  'style',
  '{"primary":"#667eea","primaryHover":"#5568d3","secondary":"#764ba2","background":"#f8f9fa","backgroundAlt":"#ffffff","text":"#2d3436","textMuted":"#636e72","border":"#dfe6e9","success":"#00b894","warning":"#fdcb6e","error":"#d63031","info":"#0984e3"}'::jsonb,
  true
);

-- Theme 17: Monochrome
INSERT INTO themes (name, display_name, description, category, css_variables, is_preset)
VALUES (
  'monochrome',
  'Monochrome',
  'Elegant black and white simplicity',
  'style',
  '{"primary":"#000000","primaryHover":"#333333","secondary":"#666666","background":"#ffffff","backgroundAlt":"#f0f0f0","text":"#000000","textMuted":"#666666","border":"#cccccc","success":"#000000","warning":"#666666","error":"#000000","info":"#333333"}'::jsonb,
  true
);

-- Theme 18: Corporate Clean
INSERT INTO themes (name, display_name, description, category, css_variables, is_preset)
VALUES (
  'corporate-clean',
  'Corporate Clean',
  'Professional business aesthetic',
  'industry',
  '{"primary":"#0052cc","primaryHover":"#0042a3","secondary":"#5e6c84","background":"#ffffff","backgroundAlt":"#f4f5f7","text":"#172b4d","textMuted":"#5e6c84","border":"#dfe1e6","success":"#36b37e","warning":"#ff991f","error":"#de350b","info":"#0065ff"}'::jsonb,
  true
);

-- Theme 19: Creative Agency
INSERT INTO themes (name, display_name, description, category, css_variables, is_preset)
VALUES (
  'creative-agency',
  'Creative Agency',
  'Bold creative studio vibes',
  'industry',
  '{"primary":"#ff4757","primaryHover":"#e63946","secondary":"#5352ed","background":"#f8f9fa","backgroundAlt":"#ffffff","text":"#2d3436","textMuted":"#636e72","border":"#dfe6e9","success":"#00d2d3","warning":"#feca57","error":"#ff4757","info":"#5352ed"}'::jsonb,
  true
);

-- Theme 20: Photography Portfolio
INSERT INTO themes (name, display_name, description, category, css_variables, is_preset)
VALUES (
  'photography-portfolio',
  'Photography Portfolio',
  'Elegant showcase for visual work',
  'industry',
  '{"primary":"#2c3e50","primaryHover":"#1a252f","secondary":"#95a5a6","background":"#ecf0f1","backgroundAlt":"#ffffff","text":"#2c3e50","textMuted":"#7f8c8d","border":"#bdc3c7","success":"#27ae60","warning":"#f39c12","error":"#e74c3c","info":"#3498db"}'::jsonb,
  true
);

-- Theme 21: E-commerce Modern
INSERT INTO themes (name, display_name, description, category, css_variables, is_preset)
VALUES (
  'ecommerce-modern',
  'E-commerce Modern',
  'Conversion-optimized shop design',
  'industry',
  '{"primary":"#00c853","primaryHover":"#00b248","secondary":"#ff6d00","background":"#ffffff","backgroundAlt":"#f5f5f5","text":"#212121","textMuted":"#757575","border":"#e0e0e0","success":"#00c853","warning":"#ffab00","error":"#d50000","info":"#2979ff"}'::jsonb,
  true
);

-- Theme 22: Tech Startup
INSERT INTO themes (name, display_name, description, category, css_variables, is_preset)
VALUES (
  'tech-startup',
  'Tech Startup',
  'Modern innovative tech company',
  'industry',
  '{"primary":"#6c5ce7","primaryHover":"#5f4dcd","secondary":"#00b894","background":"#ffffff","backgroundAlt":"#f8f9fa","text":"#2d3436","textMuted":"#636e72","border":"#dfe6e9","success":"#00b894","warning":"#fdcb6e","error":"#d63031","info":"#0984e3"}'::jsonb,
  true
);

-- Theme 23: Pastel Dreams
INSERT INTO themes (name, display_name, description, category, css_variables, is_preset)
VALUES (
  'pastel-dreams',
  'Pastel Dreams',
  'Soft dreamy pastel colors',
  'color',
  '{"primary":"#c7ceea","primaryHover":"#b3bad5","secondary":"#ffc8dd","background":"#fff9fb","backgroundAlt":"#ffffff","text":"#2d3436","textMuted":"#636e72","border":"#e8daef","success":"#a8dadc","warning":"#ffd6a5","error":"#ffafcc","info":"#cdb4db"}'::jsonb,
  true
);

-- Theme 24: Neon Vibes
INSERT INTO themes (name, display_name, description, category, css_variables, is_preset)
VALUES (
  'neon-vibes',
  'Neon Vibes',
  'Electric neon color explosion',
  'color',
  '{"primary":"#ff006e","primaryHover":"#d9005e","secondary":"#8338ec","background":"#0a0a0a","backgroundAlt":"#1a1a1a","text":"#ffffff","textMuted":"#b0b0b0","border":"#ff006e","success":"#06ffa5","warning":"#ffbe0b","error":"#ff006e","info":"#3a86ff"}'::jsonb,
  true
);

-- Theme 25: Colorful Pop
INSERT INTO themes (name, display_name, description, category, css_variables, is_preset)
VALUES (
  'colorful-pop',
  'Colorful Pop',
  'Vibrant playful rainbow',
  'color',
  '{"primary":"#ff006e","primaryHover":"#d9005e","secondary":"#ffbe0b","background":"#ffffff","backgroundAlt":"#f8f9fa","text":"#000000","textMuted":"#666666","border":"#e0e0e0","success":"#06ffa5","warning":"#ffbe0b","error":"#ff006e","info":"#3a86ff"}'::jsonb,
  true
);

-- Theme 26: Dark Mode Pro
INSERT INTO themes (name, display_name, description, category, css_variables, is_preset)
VALUES (
  'dark-mode-pro',
  'Dark Mode Pro',
  'Professional dark interface',
  'color',
  '{"primary":"#3b82f6","primaryHover":"#2563eb","secondary":"#8b5cf6","background":"#0f172a","backgroundAlt":"#1e293b","text":"#f1f5f9","textMuted":"#94a3b8","border":"#334155","success":"#10b981","warning":"#f59e0b","error":"#ef4444","info":"#3b82f6"}'::jsonb,
  true
);

-- Theme 27: Ocean Blue
INSERT INTO themes (name, display_name, description, category, css_variables, is_preset)
VALUES (
  'ocean-blue',
  'Ocean Blue',
  'Deep calming ocean depths',
  'color',
  '{"primary":"#006994","primaryHover":"#005578","secondary":"#0090c1","background":"#f0f8ff","backgroundAlt":"#ffffff","text":"#003d5b","textMuted":"#5f8ca8","border":"#b8d4e3","success":"#00a896","warning":"#ffa600","error":"#ff5a5f","info":"#0090c1"}'::jsonb,
  true
);

-- Theme 28: Space Explorer
INSERT INTO themes (name, display_name, description, category, css_variables, is_preset)
VALUES (
  'space-explorer',
  'Space Explorer',
  'Cosmic deep space adventure',
  'special',
  '{"primary":"#4a00e0","primaryHover":"#3a00b0","secondary":"#8e2de2","background":"#0a0015","backgroundAlt":"#1a0028","text":"#ffffff","textMuted":"#b0b0c0","border":"#4a00e0","success":"#00ff88","warning":"#ffbb00","error":"#ff0066","info":"#00aaff"}'::jsonb,
  true
);

-- Theme 29: Steampunk Vintage
INSERT INTO themes (name, display_name, description, category, css_variables, is_preset)
VALUES (
  'steampunk-vintage',
  'Steampunk Vintage',
  'Victorian industrial retro',
  'special',
  '{"primary":"#8b4513","primaryHover":"#6d3610","secondary":"#cd853f","background":"#2c1810","backgroundAlt":"#3d2418","text":"#f5deb3","textMuted":"#d2b48c","border":"#8b4513","success":"#6b8e23","warning":"#ff8c00","error":"#dc143c","info":"#4682b4"}'::jsonb,
  true
);

-- Theme 30: Art Gallery
INSERT INTO themes (name, display_name, description, category, css_variables, is_preset)
VALUES (
  'art-gallery',
  'Art Gallery',
  'Refined gallery exhibition space',
  'special',
  '{"primary":"#1a1a1a","primaryHover":"#000000","secondary":"#8e8e8e","background":"#fafafa","backgroundAlt":"#ffffff","text":"#1a1a1a","textMuted":"#666666","border":"#d0d0d0","success":"#2ecc71","warning":"#f39c12","error":"#e74c3c","info":"#3498db"}'::jsonb,
  true
);

-- Theme 31: Social Media Style
INSERT INTO themes (name, display_name, description, category, css_variables, is_preset)
VALUES (
  'social-media-style',
  'Social Media Style',
  'Modern social network aesthetic',
  'special',
  '{"primary":"#1877f2","primaryHover":"#0d65d9","secondary":"#42b72a","background":"#f0f2f5","backgroundAlt":"#ffffff","text":"#1c1e21","textMuted":"#65676b","border":"#ccd0d5","success":"#42b72a","warning":"#ff9800","error":"#f02849","info":"#1877f2"}'::jsonb,
  true
);

-- ==============================================================================
-- SET DEFAULT ACTIVE THEME
-- ==============================================================================
-- Set "Minimalist Clean" as the default active theme
UPDATE active_theme 
SET theme_id = (SELECT id FROM themes WHERE name = 'minimalist-clean')
WHERE id = 1;

-- Success message
COMMENT ON TABLE themes IS 'Theme management system with 31 preset themes auto-loaded. No manual import required!';;