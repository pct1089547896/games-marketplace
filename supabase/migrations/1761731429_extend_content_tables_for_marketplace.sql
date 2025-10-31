-- Migration: extend_content_tables_for_marketplace
-- Created at: 1761731429

-- Extend games table with new fields
ALTER TABLE games
ADD COLUMN IF NOT EXISTS platform text[] DEFAULT ARRAY['Windows'],
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS current_version text DEFAULT '1.0.0',
ADD COLUMN IF NOT EXISTS system_requirements jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS average_rating numeric(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_ratings integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS content_status text DEFAULT 'stable' CHECK (content_status IN ('stable', 'beta', 'development')),
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS uploader_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL;

-- Extend programs table with new fields
ALTER TABLE programs
ADD COLUMN IF NOT EXISTS platform text[] DEFAULT ARRAY['Windows'],
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS current_version text DEFAULT '1.0.0',
ADD COLUMN IF NOT EXISTS system_requirements jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS average_rating numeric(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_ratings integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS content_status text DEFAULT 'stable' CHECK (content_status IN ('stable', 'beta', 'development')),
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS uploader_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_games_platform ON games USING GIN (platform);
CREATE INDEX IF NOT EXISTS idx_games_tags ON games USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_games_average_rating ON games(average_rating);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_games_download_count ON games(download_count DESC);

CREATE INDEX IF NOT EXISTS idx_programs_platform ON programs USING GIN (platform);
CREATE INDEX IF NOT EXISTS idx_programs_tags ON programs USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_programs_average_rating ON programs(average_rating);
CREATE INDEX IF NOT EXISTS idx_programs_created_at ON programs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_programs_download_count ON programs(download_count DESC);;