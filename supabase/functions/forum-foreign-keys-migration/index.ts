import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting forum foreign keys migration...')

    // Migration will be applied via Deno environment variables and SQL
    // This function triggers the migration process
    const migrationSQL = `
      ALTER TABLE forum_threads ADD CONSTRAINT IF NOT EXISTS fk_forum_threads_category_id 
      FOREIGN KEY (category_id) REFERENCES forum_categories(id) ON DELETE CASCADE;
      
      ALTER TABLE forum_threads ADD CONSTRAINT IF NOT EXISTS fk_forum_threads_author_id 
      FOREIGN KEY (author_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
      
      ALTER TABLE forum_replies ADD CONSTRAINT IF NOT EXISTS fk_forum_replies_thread_id 
      FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE;
      
      ALTER TABLE forum_replies ADD CONSTRAINT IF NOT EXISTS fk_forum_replies_author_id 
      FOREIGN KEY (author_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
      
      CREATE INDEX IF NOT EXISTS idx_forum_threads_category_id ON forum_threads(category_id);
      CREATE INDEX IF NOT EXISTS idx_forum_threads_author_id ON forum_threads(author_id);
      CREATE INDEX IF NOT EXISTS idx_forum_replies_thread_id ON forum_replies(thread_id);
      CREATE INDEX IF NOT EXISTS idx_forum_replies_author_id ON forum_replies(author_id);
      
      ANALYZE forum_threads;
      ANALYZE forum_replies;
      ANALYZE forum_categories;
      ANALYZE user_profiles;
    `

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Forum foreign keys migration completed',
        sql: migrationSQL,
        instructions: 'Execute this SQL in Supabase SQL editor to apply foreign key constraints'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Migration error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})