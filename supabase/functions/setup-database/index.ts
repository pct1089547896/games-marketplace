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

    const sqlStatements = [
      // Drop existing tables if they exist (for clean setup)
      `DROP TABLE IF EXISTS public.user_favorites CASCADE;`,
      `DROP TABLE IF EXISTS public.programs CASCADE;`,
      `DROP TABLE IF EXISTS public.games CASCADE;`,
      `DROP TABLE IF EXISTS public.blogs CASCADE;`,
      
      // Create user_favorites table
      `CREATE TABLE public.user_favorites (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        content_id UUID NOT NULL,
        content_type TEXT NOT NULL CHECK (content_type IN ('program', 'game', 'blog', 'thread')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        UNIQUE(user_id, content_id, content_type)
      );`,
      
      // Create programs table
      `CREATE TABLE public.programs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        long_description TEXT,
        price DECIMAL(10,2) DEFAULT 0.00,
        category TEXT,
        tags TEXT[],
        image_url TEXT,
        developer_id UUID REFERENCES auth.users(id),
        download_count INTEGER DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 0.00,
        review_count INTEGER DEFAULT 0,
        featured BOOLEAN DEFAULT false,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );`,
      
      // Create games table
      `CREATE TABLE public.games (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        long_description TEXT,
        price DECIMAL(10,2) DEFAULT 0.00,
        genre TEXT,
        tags TEXT[],
        image_url TEXT,
        developer_id UUID REFERENCES auth.users(id),
        download_count INTEGER DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 0.00,
        review_count INTEGER DEFAULT 0,
        featured BOOLEAN DEFAULT false,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );`,
      
      // Create blogs table
      `CREATE TABLE public.blogs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        author_id UUID REFERENCES auth.users(id),
        tags TEXT[],
        image_url TEXT,
        featured BOOLEAN DEFAULT false,
        status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
        published_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );`,
      
      // Enable RLS on all tables
      `ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;`
    ];

    const results = [];
    
    // Execute each SQL statement
    for (const sql of sqlStatements) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query: sql })
        });
        
        const result = {
          sql: sql.substring(0, 50) + '...',
          status: response.status,
          ok: response.ok,
          response: response.ok ? 'Success' : await response.text()
        };
        
        results.push(result);
      } catch (error) {
        results.push({
          sql: sql.substring(0, 50) + '...',
          status: 'error',
          ok: false,
          response: error.message
        });
      }
    }

    // Create RLS policies
    const policies = [
      // User favorites policies
      `CREATE POLICY "Users can view their own favorites" ON public.user_favorites FOR SELECT USING (auth.uid() = user_id);`,
      `CREATE POLICY "Users can insert their own favorites" ON public.user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      `CREATE POLICY "Users can update their own favorites" ON public.user_favorites FOR UPDATE USING (auth.uid() = user_id);`,
      `CREATE POLICY "Users can delete their own favorites" ON public.user_favorites FOR DELETE USING (auth.uid() = user_id);`,
      
      // Programs policies
      `CREATE POLICY "Programs are viewable by everyone" ON public.programs FOR SELECT USING (status = 'active' OR auth.uid() = developer_id);`,
      `CREATE POLICY "Users can insert their own programs" ON public.programs FOR INSERT WITH CHECK (auth.uid() = developer_id);`,
      `CREATE POLICY "Users can update their own programs" ON public.programs FOR UPDATE USING (auth.uid() = developer_id);`,
      `CREATE POLICY "Users can delete their own programs" ON public.programs FOR DELETE USING (auth.uid() = developer_id);`,
      
      // Games policies
      `CREATE POLICY "Games are viewable by everyone" ON public.games FOR SELECT USING (status = 'active' OR auth.uid() = developer_id);`,
      `CREATE POLICY "Users can insert their own games" ON public.games FOR INSERT WITH CHECK (auth.uid() = developer_id);`,
      `CREATE POLICY "Users can update their own games" ON public.games FOR UPDATE USING (auth.uid() = developer_id);`,
      `CREATE POLICY "Users can delete their own games" ON public.games FOR DELETE USING (auth.uid() = developer_id);`,
      
      // Blogs policies
      `CREATE POLICY "Blogs are viewable by everyone" ON public.blogs FOR SELECT USING (status = 'published' OR auth.uid() = author_id);`,
      `CREATE POLICY "Users can insert their own blogs" ON public.blogs FOR INSERT WITH CHECK (auth.uid() = author_id);`,
      `CREATE POLICY "Users can update their own blogs" ON public.blogs FOR UPDATE USING (auth.uid() = author_id);`,
      `CREATE POLICY "Users can delete their own blogs" ON public.blogs FOR DELETE USING (auth.uid() = author_id);`
    ];

    const policyResults = [];
    
    for (const policy of policies) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query: policy })
        });
        
        const result = {
          policy: policy.substring(0, 50) + '...',
          status: response.status,
          ok: response.ok,
          response: response.ok ? 'Success' : await response.text()
        };
        
        policyResults.push(result);
      } catch (error) {
        policyResults.push({
          policy: policy.substring(0, 50) + '...',
          status: 'error',
          ok: false,
          response: error.message
        });
      }
    }

    // Test API access
    const testResults = {};
    const tables = ['user_favorites', 'programs', 'games', 'blogs'];
    
    for (const table of tables) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*&limit=1`, {
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
          }
        });
        
        testResults[table] = {
          status: response.status,
          ok: response.ok,
          response: response.ok ? 'Success' : await response.text()
        };
      } catch (error) {
        testResults[table] = {
          status: 'error',
          ok: false,
          response: error.message
        };
      }
    }

    // Refresh schema cache
    try {
      await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: 'NOTIFY pgrst, \'reload schema\';' })
      });
    } catch (error) {
      // Schema refresh might fail but that's okay
    }

    return new Response(JSON.stringify({ 
      success: true,
      table_creation: results,
      policy_creation: policyResults,
      api_tests: testResults,
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