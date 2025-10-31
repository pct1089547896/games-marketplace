CREATE TABLE featured_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    content_items JSONB DEFAULT '[]',
    collection_type TEXT NOT NULL CHECK (collection_type IN ('game',
    'program',
    'mixed')),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);