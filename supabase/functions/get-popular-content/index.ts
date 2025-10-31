Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const contentType = url.searchParams.get('contentType') || 'game';
    const timeRange = url.searchParams.get('timeRange') || 'week';
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');

    if (!serviceRoleKey || !supabaseUrl) {
      throw new Error('Supabase configuration missing');
    }

    const tableName = contentType === 'game' ? 'games' : 'programs';
    
    // Calculate date range
    const now = new Date();
    let dateFilter = '';
    if (timeRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = `&created_at=gte.${weekAgo.toISOString()}`;
    } else if (timeRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = `&created_at=gte.${monthAgo.toISOString()}`;
    }

    // Get popular content based on download count and views
    const response = await fetch(
      `${supabaseUrl}/rest/v1/${tableName}?select=*&order=download_count.desc,view_count.desc${dateFilter}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch popular content: ${errorText}`);
    }

    const popularContent = await response.json();

    // Get recently added content
    const recentResponse = await fetch(
      `${supabaseUrl}/rest/v1/${tableName}?select=*&order=created_at.desc&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey
        }
      }
    );

    const recentContent = recentResponse.ok ? await recentResponse.json() : [];

    // Get top rated content
    const topRatedResponse = await fetch(
      `${supabaseUrl}/rest/v1/${tableName}?select=*&average_rating=gte.4&order=average_rating.desc,total_ratings.desc&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey
        }
      }
    );

    const topRatedContent = topRatedResponse.ok ? await topRatedResponse.json() : [];

    return new Response(JSON.stringify({ 
      data: {
        popular: popularContent,
        recent: recentContent,
        topRated: topRatedContent,
        timeRange: timeRange,
        contentType: contentType
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get popular content error:', error);
    return new Response(JSON.stringify({
      error: {
        code: 'GET_POPULAR_CONTENT_FAILED',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
