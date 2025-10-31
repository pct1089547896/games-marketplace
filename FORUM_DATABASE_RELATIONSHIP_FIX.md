# Forum Database Relationship Fix

## ⚠️ Error Fix Applied

**If you encountered this error:**
```
ERROR:  42601: syntax error at or near "NOT"
LINE 2: ALTER TABLE forum_threads ADD CONSTRAINT IF NOT EXISTS fk_forum_threads_category_id
```

**Solution**: PostgreSQL doesn't support `IF NOT EXISTS` for `ALTER TABLE ADD CONSTRAINT`. Use the corrected SQL below.

## Problem
The forum system is failing with a PostgreSQL relationship error:
```
"Could not find a relationship between 'forum_threads' and 'forum_categories' in the schema cache"
```

This occurs because the foreign key constraints between forum tables are missing.

## Solution
Run the following SQL in your Supabase SQL Editor (dashboard > SQL Editor):

### Option 1: Simple Version (Recommended)
```sql
-- Add foreign key constraints
ALTER TABLE forum_threads ADD CONSTRAINT fk_forum_threads_category_id 
FOREIGN KEY (category_id) REFERENCES forum_categories(id) ON DELETE CASCADE;

ALTER TABLE forum_threads ADD CONSTRAINT fk_forum_threads_author_id 
FOREIGN KEY (author_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE forum_replies ADD CONSTRAINT fk_forum_replies_thread_id 
FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE;

ALTER TABLE forum_replies ADD CONSTRAINT fk_forum_replies_author_id 
FOREIGN KEY (author_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

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
```

### Option 2: PostgreSQL-Safe Version (If running multiple times)
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
```

## What This Fixes
1. **Inner Join Error**: The forum category page query `forum_categories!inner(slug)` will now work
2. **Performance**: Added indexes for faster queries on forum relationships
3. **Data Integrity**: Foreign key constraints ensure referential integrity
4. **Cascade Deletion**: When categories or users are deleted, related content is properly cleaned up

## After Running the Fix
1. Refresh your forum pages - posts should now appear properly
2. Forum thread creation and viewing should work without errors
3. The "Could not find a relationship" error should be resolved

## How to Access Supabase SQL Editor
1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project (dieqhiezcpexkivklxcw)
3. Click on "SQL Editor" in the left sidebar
4. Paste the SQL above and click "Run"
