const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://dieqhiezcpexkivklxcw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXFoaWV6Y3BleGtpdmtseGN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTcwNDQ4MiwiZXhwIjoyMDc3MjgwNDgyfQ.mziNagv1mNV2BJ2ex3O9wZJGBTDXgpuLr-Jek65352I';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Migration SQL
const migrationSQL = `
-- Add foreign key constraints for forum tables
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
`;

async function runMigration() {
  try {
    console.log('Starting forum foreign keys migration...');
    
    // Use the postgres RPC to execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Migration failed:', error);
      
      // Try alternative approach: split into multiple statements
      console.log('Trying alternative approach with individual statements...');
      
      const statements = [
        'ALTER TABLE forum_threads ADD CONSTRAINT fk_forum_threads_category_id FOREIGN KEY (category_id) REFERENCES forum_categories(id) ON DELETE CASCADE;',
        'ALTER TABLE forum_threads ADD CONSTRAINT fk_forum_threads_author_id FOREIGN KEY (author_id) REFERENCES user_profiles(id) ON DELETE CASCADE;',
        'ALTER TABLE forum_replies ADD CONSTRAINT fk_forum_replies_thread_id FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE;',
        'ALTER TABLE forum_replies ADD CONSTRAINT fk_forum_replies_author_id FOREIGN KEY (author_id) REFERENCES user_profiles(id) ON DELETE CASCADE;',
        'CREATE INDEX IF NOT EXISTS idx_forum_threads_category_id ON forum_threads(category_id);',
        'CREATE INDEX IF NOT EXISTS idx_forum_threads_author_id ON forum_threads(author_id);',
        'CREATE INDEX IF NOT EXISTS idx_forum_replies_thread_id ON forum_replies(thread_id);',
        'CREATE INDEX IF NOT EXISTS idx_forum_replies_author_id ON forum_replies(author_id);'
      ];
      
      for (const statement of statements) {
        try {
          console.log('Executing:', statement);
          const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement });
          if (stmtError) {
            console.log('Statement failed (might already exist):', stmtError.message);
          } else {
            console.log('Statement executed successfully');
          }
        } catch (stmtErr) {
          console.log('Statement execution error:', stmtErr);
        }
      }
    } else {
      console.log('Migration executed successfully:', data);
    }
    
    console.log('Migration process completed.');
    
  } catch (error) {
    console.error('Migration error:', error);
  }
}

// Run the migration
runMigration();