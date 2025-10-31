-- Migration: add_forum_foreign_keys
-- Created at: 1761738170
-- Description: Add missing foreign key constraints for forum tables

-- Add foreign key constraint between forum_threads and forum_categories
ALTER TABLE forum_threads 
ADD CONSTRAINT fk_forum_threads_category_id 
FOREIGN KEY (category_id) REFERENCES forum_categories(id) ON DELETE CASCADE;

-- Add foreign key constraint between forum_threads and user_profiles (author_id)
ALTER TABLE forum_threads 
ADD CONSTRAINT fk_forum_threads_author_id 
FOREIGN KEY (author_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint between forum_replies and forum_threads
ALTER TABLE forum_replies 
ADD CONSTRAINT fk_forum_replies_thread_id 
FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE;

-- Add foreign key constraint between forum_replies and user_profiles (author_id)
ALTER TABLE forum_replies 
ADD CONSTRAINT fk_forum_replies_author_id 
FOREIGN KEY (author_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_threads_category_id ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_author_id ON forum_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread_id ON forum_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_author_id ON forum_replies(author_id);

-- Update the schema cache by refreshing all table statistics
ANALYZE forum_threads;
ANALYZE forum_replies;
ANALYZE forum_categories;
ANALYZE user_profiles;
