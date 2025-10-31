Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Create user_favorites table if it doesn't exist
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.user_favorites (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        content_id UUID NOT NULL,
        content_type TEXT NOT NULL CHECK (content_type IN ('program', 'game', 'blog', 'thread')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        UNIQUE(user_id, content_id, content_type)
      );

      -- Enable RLS
      ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

      -- Create policies
      CREATE POLICY "Users can view their own favorites" ON public.user_favorites
        FOR SELECT USING (auth.uid() = user_id);

      CREATE POLICY "Users can insert their own favorites" ON public.user_favorites
        FOR INSERT WITH CHECK (auth.uid() = user_id);

      CREATE POLICY "Users can update their own favorites" ON public.user_favorites
        FOR UPDATE USING (auth.uid() = user_id);

      CREATE POLICY "Users can delete their own favorites" ON public.user_favorites
        FOR DELETE USING (auth.uid() = user_id);
    `;

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: createTableSQL
      })
    });

    let tableCreationResult = {};
    if (response.ok) {
      tableCreationResult = await response.json();
    } else {
      tableCreationResult = { error: await response.text() };
    }

    // Test the table with a sample query
    const testResponse = await fetch(`${supabaseUrl}/rest/v1/user_favorites?select=*&limit=1`, {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      }
    });

    const testStatus = testResponse.status;
    const testData = await testResponse.text();

    return new Response(JSON.stringify({ 
      success: true,
      table_creation: tableCreationResult,
      test_query_status: testStatus,
      test_query_response: testData,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});