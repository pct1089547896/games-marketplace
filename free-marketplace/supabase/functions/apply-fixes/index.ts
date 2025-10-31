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

    // Test user_favorites access
    const userFavoritesResponse = await fetch(`${supabaseUrl}/rest/v1/user_favorites?select=*&limit=1`, {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      }
    });

    // Test content tables access
    const programsResponse = await fetch(`${supabaseUrl}/rest/v1/programs?select=*&limit=1`, {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      }
    });

    const gamesResponse = await fetch(`${supabaseUrl}/rest/v1/games?select=*&limit=1`, {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      }
    });

    const blogsResponse = await fetch(`${supabaseUrl}/rest/v1/blogs?select=*&limit=1`, {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      }
    });

    const results = {
      user_favorites: {
        status: userFavoritesResponse.status,
        ok: userFavoritesResponse.ok,
        response: userFavoritesResponse.ok ? 'Success' : await userFavoritesResponse.text()
      },
      programs: {
        status: programsResponse.status,
        ok: programsResponse.ok,
        response: programsResponse.ok ? 'Success' : await programsResponse.text()
      },
      games: {
        status: gamesResponse.status,
        ok: gamesResponse.ok,
        response: gamesResponse.ok ? 'Success' : await gamesResponse.text()
      },
      blogs: {
        status: blogsResponse.status,
        ok: blogsResponse.ok,
        response: blogsResponse.ok ? 'Success' : await blogsResponse.text()
      }
    };

    return new Response(JSON.stringify({ 
      success: true,
      results,
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