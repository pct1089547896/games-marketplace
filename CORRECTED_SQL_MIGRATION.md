# Corrected SQL Migration for Forum Foreign Keys

## PostgreSQL-Safe Migration

The error occurred because PostgreSQL doesn't support `IF NOT EXISTS` for `ALTER TABLE ADD CONSTRAINT`. Here's the corrected version:

```sql
-- Check and add foreign key constraints safely

-- Check if fk_forum_threads_category_id exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_forum_threads_category_id' 
        AND table_name = 'forum_threads'
    ) THEN
        ALTER TABLE forum_threads 
        ADD CONSTRAINT fk_forum_threads_category_id 
        FOREIGN KEY (category_id) REFERENCES forum_categories(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check if fk_forum_threads_author_id exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_forum_threads_author_id' 
        AND table_name = 'forum_threads'
    ) THEN
        ALTER TABLE forum_threads 
        ADD CONSTRAINT fk_forum_threads_author_id 
        FOREIGN KEY (author_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check if fk_forum_replies_thread_id exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_forum_replies_thread_id' 
        AND table_name = 'forum_replies'
    ) THEN
        ALTER TABLE forum_replies 
        ADD CONSTRAINT fk_forum_replies_thread_id 
        FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check if fk_forum_replies_author_id exists, if not add it
DO $$
BEGIN
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_threads_category_id ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_author_id ON forum_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread_id ON forum_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_author_id ON forum_replies(author_id);

-- Update table statistics
ANALYZE forum_threads;
ANALYZE forum_replies;
ANALYZE forum_categories;
ANALYZE user_profiles;

-- Success message
SELECT 'Forum foreign keys migration completed successfully!' as result;
```

## Alternative Simple Version

If you prefer a simpler approach (only run if constraints don't already exist):

```sql
-- Alternative: Add constraints directly (will fail if they exist, which is OK)
ALTER TABLE forum_threads ADD CONSTRAINT fk_forum_threads_category_id 
FOREIGN KEY (category_id) REFERENCES forum_categories(id) ON DELETE CASCADE;

ALTER TABLE forum_threads ADD CONSTRAINT fk_forum_threads_author_id 
FOREIGN KEY (author_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE forum_replies ADD CONSTRAINT fk_forum_replies_thread_id 
FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE;

ALTER TABLE forum_replies ADD CONSTRAINT fk_forum_replies_author_id 
FOREIGN KEY (author_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_forum_threads_category_id ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_author_id ON forum_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread_id ON forum_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_author_id ON forum_replies(author_id);

-- Update statistics
ANALYZE forum_threads;
ANALYZE forum_replies;
ANALYZE forum_categories;
ANALYZE user_profiles;
```

## What This Fixes

1. **PostgreSQL Compatibility**: Uses DO blocks to safely check for existing constraints
2. **Idempotent**: Can be run multiple times without errors
3. **Performance**: Adds indexes for faster queries
4. **Data Integrity**: Enforces referential integrity between tables

## After Running the Migration

1. The `forum_categories!inner(slug)` query syntax will work perfectly
2. Forum queries will be more efficient
3. Data integrity will be maintained
4. Cascade deletions will work properly

Try the corrected SQL above - it should run without errors!
