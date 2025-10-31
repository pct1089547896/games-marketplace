Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { contentId, contentType } = await req.json();

    if (!contentId || !contentType) {
      throw new Error('contentId and contentType are required');
    }

    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');

    if (!serviceRoleKey || !supabaseUrl) {
      throw new Error('Supabase configuration missing');
    }

    // Get user ID from auth header (if logged in)
    let userId = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'apikey': serviceRoleKey
          }
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          userId = userData.id;
        }
      } catch (e) {
        // Continue without user ID
      }
    }

    // Track download
    const trackResponse = await fetch(`${supabaseUrl}/rest/v1/download_tracking`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        content_id: contentId,
        content_type: contentType,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown'
      })
    });

    if (!trackResponse.ok) {
      const errorText = await trackResponse.text();
      console.error('Track failed:', errorText);
    }

    // Update download count in content table
    const tableName = contentType === 'game' ? 'games' : 'programs';
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/${tableName}?id=eq.${contentId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        download_count: `download_count + 1`
      })
    });

    // Use raw SQL to increment
    const sqlResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/increment_download_count`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        table_name: tableName,
        item_id: contentId
      })
    });

    return new Response(JSON.stringify({ 
      data: { success: true, message: 'Download tracked successfully' }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Track download error:', error);
    return new Response(JSON.stringify({
      error: {
        code: 'TRACK_DOWNLOAD_FAILED',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
