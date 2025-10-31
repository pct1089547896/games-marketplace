CREATE TABLE download_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    content_id UUID NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('game',
    'program')),
    ip_address TEXT,
    downloaded_at TIMESTAMPTZ DEFAULT NOW()
);