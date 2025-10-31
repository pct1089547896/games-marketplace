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
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");

    if (!serviceRoleKey || !supabaseUrl) {
      throw new Error("Missing required environment variables");
    }

    // First, create the PostgreSQL function
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION setup_hero_storage_policies()
      RETURNS json
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS \\$\\$ 
      DECLARE
        result json;
      BEGIN
        -- Enable RLS on storage.objects
        BEGIN
          EXECUTE 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY';
        EXCEPTION WHEN others THEN NULL;
        END;

        -- Drop existing policies
        BEGIN
          EXECUTE 'DROP POLICY IF EXISTS "hero_media_upload_policy" ON storage.objects';
          EXECUTE 'DROP POLICY IF EXISTS "hero_media_select_public" ON storage.objects';
          EXECUTE 'DROP POLICY IF EXISTS "hero_media_select_auth" ON storage.objects';
          EXECUTE 'DROP POLICY IF EXISTS "hero_media_update_policy" ON storage.objects';
          EXECUTE 'DROP POLICY IF EXISTS "hero_media_delete_policy" ON storage.objects';
        EXCEPTION WHEN others THEN NULL;
        END;

        -- Create new RLS policies
        BEGIN
          EXECUTE 'CREATE POLICY "hero_media_upload_policy" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = ''hero-media'')';
        EXCEPTION WHEN others THEN
          RAISE EXCEPTION 'Failed to create upload policy: %', SQLERRM;
        END;

        BEGIN
          EXECUTE 'CREATE POLICY "hero_media_select_public" ON storage.objects FOR SELECT TO public USING (bucket_id = ''hero-media'')';
        EXCEPTION WHEN others THEN
          RAISE EXCEPTION 'Failed to create public select policy: %', SQLERRM;
        END;

        BEGIN
          EXECUTE 'CREATE POLICY "hero_media_select_auth" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = ''hero-media'')';
        EXCEPTION WHEN others THEN
          RAISE EXCEPTION 'Failed to create auth select policy: %', SQLERRM;
        END;

        BEGIN
          EXECUTE 'CREATE POLICY "hero_media_update_policy" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = ''hero-media'') WITH CHECK (bucket_id = ''hero-media'')';
        EXCEPTION WHEN others THEN
          RAISE EXCEPTION 'Failed to create update policy: %', SQLERRM;
        END;

        BEGIN
          EXECUTE 'CREATE POLICY "hero_media_delete_policy" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = ''hero-media'')';
        EXCEPTION WHEN others THEN
          RAISE EXCEPTION 'Failed to create delete policy: %', SQLERRM;
        END;

        -- Return success
        result := json_build_object('success', true, 'message', 'Storage RLS policies configured');
        RETURN result;
      END;
      \\$\\$;
    `;

    // Execute SQL to create the function
    const sqlResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        apikey: serviceRoleKey,
      },
      body: JSON.stringify({ sql: createFunctionSQL })
    });

    let sqlResult;
    try {
      sqlResult = await sqlResponse.json();
    } catch (e) {
      sqlResult = { error: `Failed to parse response: ${e.message}` };
    }

    // Now call the function to set up policies
    const callFunctionResponse = await fetch(
      `${supabaseUrl}/rest/v1/rpc/setup_hero_storage_policies`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
          apikey: serviceRoleKey,
        },
        body: JSON.stringify({})
      }
    );

    let functionResult;
    try {
      functionResult = await callFunctionResponse.json();
    } catch (e) {
      functionResult = { error: `Failed to parse function response: ${e.message}` };
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Storage RLS setup completed!",
        sqlResult: sqlResult,
        functionResult: functionResult,
        callFunctionStatus: callFunctionResponse.status
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error setting up storage RLS:", error);
    return new Response(
      JSON.stringify({
        error: {
          code: "RLS_SETUP_ERROR",
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