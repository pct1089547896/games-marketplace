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

    // Test user_favorites table
    const userFavoritesResponse = await fetch(`${supabaseUrl}/rest/v1/user_favorites?select=*&limit=1`, {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      }
    });

    const userFavoritesStatus = userFavoritesResponse.status;
    const userFavoritesData = await userFavoritesResponse.text();

    // Check if table exists and get column info
    const tableInfoResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/get_table_info`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        table_name: 'user_favorites'
      })
    });

    let tableInfo = {};
    if (tableInfoResponse.ok) {
      tableInfo = await tableInfoResponse.json();
    }

    return new Response(JSON.stringify({ 
      success: true,
      user_favorites_status: userFavoritesStatus,
      user_favorites_response: userFavoritesData,
      table_info: tableInfo,
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