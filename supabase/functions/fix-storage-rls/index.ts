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

    // Enable RLS on storage.objects if not already enabled
    const enableRlsResponse = await fetch(
      `${supabaseUrl}/rest/v1/rpc/sql`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
          apikey: serviceRoleKey,
        },
        body: JSON.stringify({
          sql: "ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;"
        }),
      }
    );

    // Drop existing policies first to avoid conflicts
    const dropPolicies = [
      "DROP POLICY IF EXISTS \"hero_media_upload\" ON storage.objects;",
      "DROP POLICY IF EXISTS \"hero_media_select_public\" ON storage.objects;",
      "DROP POLICY IF EXISTS \"hero_media_select_auth\" ON storage.objects;",
      "DROP POLICY IF EXISTS \"hero_media_delete\" ON storage.objects;",
      "DROP POLICY IF EXISTS \"hero_media_update\" ON storage.objects;"
    ];

    const dropResults = [];
    for (const dropSql of dropPolicies) {
      try {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/rpc/sql`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${serviceRoleKey}`,
              "Content-Type": "application/json",
              apikey: serviceRoleKey,
            },
            body: JSON.stringify({ sql: dropSql }),
          }
        );
        const result = await response.json();
        dropResults.push({ sql: dropSql, result });
      } catch (error) {
        dropResults.push({ sql: dropSql, error: error.message });
      }
    }

    // Create new RLS policies
    const policies = [
      {
        name: "hero_media_upload_policy",
        sql: `CREATE POLICY "hero_media_upload_policy" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'hero-media' AND auth.jwt() ->> 'role' = 'authenticated');`
      },
      {
        name: "hero_media_select_public",
        sql: `CREATE POLICY "hero_media_select_public" ON storage.objects FOR SELECT TO public USING (bucket_id = 'hero-media');`
      },
      {
        name: "hero_media_select_auth",
        sql: `CREATE POLICY "hero_media_select_auth" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'hero-media');`
      },
      {
        name: "hero_media_update_policy",
        sql: `CREATE POLICY "hero_media_update_policy" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'hero-media') WITH CHECK (bucket_id = 'hero-media');`
      },
      {
        name: "hero_media_delete_policy",
        sql: `CREATE POLICY "hero_media_delete_policy" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'hero-media');`
      }
    ];

    const policyResults = [];
    for (const policy of policies) {
      try {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/rpc/sql`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${serviceRoleKey}`,
              "Content-Type": "application/json",
              apikey: serviceRoleKey,
            },
            body: JSON.stringify({ sql: policy.sql }),
          }
        );

        const result = await response.json();
        policyResults.push({ policy: policy.name, result });
        console.log(`Policy ${policy.name} created successfully:`, result);
      } catch (error) {
        console.error(`Error creating policy ${policy.name}:`, error);
        policyResults.push({ policy: policy.name, error: error.message });
      }
    }

    // Grant necessary permissions
    const grants = [
      "GRANT USAGE ON SCHEMA storage TO authenticated;",
      "GRANT ALL ON storage.objects TO authenticated;",
      "GRANT ALL ON storage.buckets TO authenticated;"
    ];

    const grantResults = [];
    for (const grant of grants) {
      try {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/rpc/sql`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${serviceRoleKey}`,
              "Content-Type": "application/json",
              apikey: serviceRoleKey,
            },
            body: JSON.stringify({ sql: grant }),
          }
        );
        const result = await response.json();
        grantResults.push({ sql: grant, result });
      } catch (error) {
        grantResults.push({ sql: grant, error: error.message });
      }
    }

    // Verify policies were created
    const verifyResponse = await fetch(
      `${supabaseUrl}/rest/v1/storage.policies?select=*&table_name=eq.objects`,
      {
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
        }
      }
    );

    const verifyResult = await verifyResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Storage RLS policies setup complete!",
        enableRlsResult: enableRlsResponse.status,
        dropResults: dropResults,
        policyResults: policyResults,
        grantResults: grantResults,
        verifyResult: verifyResult,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error fixing storage RLS:", error);
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