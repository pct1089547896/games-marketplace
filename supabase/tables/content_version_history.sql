CREATE TABLE content_version_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('game',
    'program')),
    version TEXT NOT NULL,
    changelog TEXT,
    release_date TIMESTAMPTZ DEFAULT NOW()
);