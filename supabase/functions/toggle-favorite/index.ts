Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { contentId, contentType, action } = await req.json();

    if (!contentId || !contentType || !action) {
      throw new Error('contentId, contentType, and action are required');
    }

    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');

    if (!serviceRoleKey || !supabaseUrl) {
      throw new Error('Supabase configuration missing');
    }

    // Get user ID from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Authentication required');
    }

    const token = authHeader.replace('Bearer ', '');
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': serviceRoleKey
      }
    });

    if (!userResponse.ok) {
      throw new Error('Invalid authentication');
    }

    const userData = await userResponse.json();
    const userId = userData.id;

    let result;
    if (action === 'add') {
      // Add to favorites
      const insertResponse = await fetch(`${supabaseUrl}/rest/v1/user_favorites`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          user_id: userId,
          content_id: contentId,
          content_type: contentType
        })
      });

      if (!insertResponse.ok) {
        const errorText = await insertResponse.text();
        throw new Error(`Failed to add favorite: ${errorText}`);
      }

      result = await insertResponse.json();
    } else if (action === 'remove') {
      // Remove from favorites
      const deleteResponse = await fetch(
        `${supabaseUrl}/rest/v1/user_favorites?user_id=eq.${userId}&content_id=eq.${contentId}&content_type=eq.${contentType}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
          }
        }
      );

      if (!deleteResponse.ok) {
        const errorText = await deleteResponse.text();
        throw new Error(`Failed to remove favorite: ${errorText}`);
      }

      result = { success: true };
    } else {
      throw new Error('Invalid action. Use "add" or "remove"');
    }

    return new Response(JSON.stringify({ 
      data: { 
        success: true,
        action: action,
        favorite: result
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Toggle favorite error:', error);
    return new Response(JSON.stringify({
      error: {
        code: 'TOGGLE_FAVORITE_FAILED',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
