CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    badge_type TEXT NOT NULL CHECK (badge_type IN ('top_contributor',
    'early_adopter',
    'game_reviewer',
    'downloader',
    'community_helper')),
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id,
    badge_type)
);