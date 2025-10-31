-- Run foreign key migration directly via Supabase REST API
-- This script adds missing foreign key constraints

-- First, check if constraints already exist
DO $$
BEGIN
    -- Add foreign key constraint between forum_threads and forum_categories
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_forum_threads_category_id' 
        AND table_name = 'forum_threads'
    ) THEN
        ALTER TABLE forum_threads 
        ADD CONSTRAINT fk_forum_threads_category_id 
        FOREIGN KEY (category_id) REFERENCES forum_categories(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key constraint between forum_threads and user_profiles
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_forum_threads_author_id' 
        AND table_name = 'forum_threads'
    ) THEN
        ALTER TABLE forum_threads 
        ADD CONSTRAINT fk_forum_threads_author_id 
        FOREIGN KEY (author_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key constraint between forum_replies and forum_threads
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_forum_replies_thread_id' 
        AND table_name = 'forum_replies'
    ) THEN
        ALTER TABLE forum_replies 
        ADD CONSTRAINT fk_forum_replies_thread_id 
        FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key constraint between forum_replies and user_profiles
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_forum_replies_author_id' 
        AND table_name = 'forum_replies'
    ) THEN
        ALTER TABLE forum_replies 
        ADD CONSTRAINT fk_forum_replies_author_id 
        FOREIGN KEY (author_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add indexes for better performance (skip if they already exist)
CREATE INDEX IF NOT EXISTS idx_forum_threads_category_id ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_author_id ON forum_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread_id ON forum_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_author_id ON forum_replies(author_id);

-- Update table statistics
ANALYZE forum_threads;
ANALYZE forum_replies;
ANALYZE forum_categories;
ANALYZE user_profiles;
