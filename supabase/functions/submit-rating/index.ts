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
    const { contentId, contentType, rating, reviewText } = await req.json();

    if (!contentId || !contentType || !rating) {
      throw new Error('contentId, contentType, and rating are required');
    }

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
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

    // Submit rating
    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/content_ratings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation,resolution=merge-duplicates'
      },
      body: JSON.stringify({
        user_id: userId,
        content_id: contentId,
        content_type: contentType,
        rating: rating,
        review_text: reviewText || null,
        is_approved: false
      })
    });

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      throw new Error(`Failed to submit rating: ${errorText}`);
    }

    const ratingData = await insertResponse.json();

    // Update average rating
    const statsResponse = await fetch(
      `${supabaseUrl}/rest/v1/content_ratings?content_id=eq.${contentId}&content_type=eq.${contentType}&is_approved=eq.true&select=rating`,
      {
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey
        }
      }
    );

    if (statsResponse.ok) {
      const ratings = await statsResponse.json();
      const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length || 0;
      const tableName = contentType === 'game' ? 'games' : 'programs';

      await fetch(`${supabaseUrl}/rest/v1/${tableName}?id=eq.${contentId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          average_rating: avgRating.toFixed(2),
          total_ratings: ratings.length
        })
      });
    }

    return new Response(JSON.stringify({ 
      data: { 
        success: true, 
        rating: ratingData[0],
        message: 'Rating submitted successfully. Pending admin approval.' 
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Submit rating error:', error);
    return new Response(JSON.stringify({
      error: {
        code: 'SUBMIT_RATING_FAILED',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
