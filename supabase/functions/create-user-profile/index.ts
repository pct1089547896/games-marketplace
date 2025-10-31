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
        const { userId, email, displayName, avatarUrl } = await req.json();

        if (!userId || !email) {
            return new Response(
                JSON.stringify({ error: { code: 'MISSING_PARAMETERS', message: 'User ID and email are required' } }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseServiceKey) {
            return new Response(
                JSON.stringify({ error: { code: 'CONFIG_ERROR', message: 'Server configuration error' } }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Check if profile already exists
        const checkResponse = await fetch(
            `${supabaseUrl}/rest/v1/user_profiles?id=eq.${userId}`,
            {
                headers: {
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const existingProfiles = await checkResponse.json();

        if (existingProfiles && existingProfiles.length > 0) {
            return new Response(
                JSON.stringify({ data: existingProfiles[0] }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Create new profile
        const profile = {
            id: userId,
            email: email,
            display_name: displayName || email.split('@')[0],
            avatar_url: avatarUrl || null,
            post_count: 0,
            created_at: new Date().toISOString(),
            last_active: new Date().toISOString()
        };

        const insertResponse = await fetch(
            `${supabaseUrl}/rest/v1/user_profiles`,
            {
                method: 'POST',
                headers: {
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(profile)
            }
        );

        if (!insertResponse.ok) {
            const errorText = await insertResponse.text();
            return new Response(
                JSON.stringify({ error: { code: 'INSERT_FAILED', message: errorText } }),
                { status: insertResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const insertedProfile = await insertResponse.json();

        return new Response(
            JSON.stringify({ data: insertedProfile[0] || insertedProfile }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ 
                error: { 
                    code: 'FUNCTION_ERROR', 
                    message: error.message 
                } 
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
