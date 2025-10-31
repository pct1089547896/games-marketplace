CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    content_id UUID NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('game',
    'program')),
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id,
    content_id,
    content_type)
);