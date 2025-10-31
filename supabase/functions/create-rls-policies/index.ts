Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the service role key from environment
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceRoleKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY not found");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    if (!supabaseUrl) {
      throw new Error("SUPABASE_URL not found");
    }

    // Execute SQL to create RLS policies
    const sqlStatements = [
      // Drop existing policies if they exist
      'DROP POLICY IF EXISTS "hero_media_upload" ON storage.objects;',
      'DROP POLICY IF EXISTS "hero_media_select_public" ON storage.objects;',
      'DROP POLICY IF EXISTS "hero_media_select_auth" ON storage.objects;',
      'DROP POLICY IF EXISTS "hero_media_delete" ON storage.objects;',
      
      // Create new policies
      'CREATE POLICY "hero_media_upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = \'hero-media\');',
      'CREATE POLICY "hero_media_select_public" ON storage.objects FOR SELECT TO public USING (bucket_id = \'hero-media\');',
      'CREATE POLICY "hero_media_select_auth" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = \'hero-media\');',
      'CREATE POLICY "hero_media_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = \'hero-media\');',
    ];

    const policyResults = [];
    
    for (const sql of sqlStatements) {
      try {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/rpc/exec_sql`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${serviceRoleKey}`,
              "Content-Type": "application/json",
              apikey: serviceRoleKey,
            },
            body: JSON.stringify({
              sql_query: sql,
            }),
          }
        );

        const result = await response.json();
        policyResults.push({ sql: sql.substring(0, 50) + '...', result });
      } catch (error) {
        policyResults.push({ sql: sql.substring(0, 50) + '...', error: error.message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "RLS policies created successfully!",
        results: policyResults,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating RLS policies:", error);
    return new Response(
      JSON.stringify({
        error: {
          code: "POLICY_CREATION_ERROR",
          message: error.message,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});