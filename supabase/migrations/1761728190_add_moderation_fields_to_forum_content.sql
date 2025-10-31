-- Migration: add_moderation_fields_to_forum_content
-- Created at: 1761728190


-- Add moderation fields to forum_threads
ALTER TABLE forum_threads 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published',
ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS flagged_reason TEXT,
ADD COLUMN IF NOT EXISTS moderated_by UUID,
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP WITH TIME ZONE;

-- Add moderation fields to forum_replies
ALTER TABLE forum_replies 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published',
ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS flagged_reason TEXT,
ADD COLUMN IF NOT EXISTS moderated_by UUID,
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for faster moderation queries
CREATE INDEX IF NOT EXISTS idx_forum_threads_status ON forum_threads(status);
CREATE INDEX IF NOT EXISTS idx_forum_threads_is_flagged ON forum_threads(is_flagged);
CREATE INDEX IF NOT EXISTS idx_forum_replies_status ON forum_replies(status);
CREATE INDEX IF NOT EXISTS idx_forum_replies_is_flagged ON forum_replies(is_flagged);
;