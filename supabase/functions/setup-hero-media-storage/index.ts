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

    // Use the service role to create bucket and policies
    const createBucketResponse = await fetch(
      `${supabaseUrl}/storage/v1/bucket`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: "hero-media",
          name: "hero-media",
          public: true,
          file_size_limit: 52428800, // 50MB
          allowed_mime_types: [
            "image/jpeg",
            "image/png", 
            "image/gif",
            "image/webp",
            "video/mp4",
            "video/webm",
            "video/quicktime"
          ],
        }),
      }
    );

    const bucketResult = await createBucketResponse.json();
    console.log("Bucket creation result:", bucketResult);

    // Create RLS policies using service role
    const policies = [
      {
        name: "hero_media_upload",
        cmd: "INSERT",
        sql: `CREATE POLICY "hero_media_upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'hero-media');`,
      },
      {
        name: "hero_media_select_public", 
        cmd: "SELECT",
        sql: `CREATE POLICY "hero_media_select_public" ON storage.objects FOR SELECT TO public USING (bucket_id = 'hero-media');`,
      },
      {
        name: "hero_media_select_auth",
        cmd: "SELECT", 
        sql: `CREATE POLICY "hero_media_select_auth" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'hero-media');`,
      },
      {
        name: "hero_media_delete",
        cmd: "DELETE",
        sql: `CREATE POLICY "hero_media_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'hero-media');`,
      },
    ];

    const policyResults = [];
    for (const policy of policies) {
      try {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/rpc/create_storage_policy`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${serviceRoleKey}`,
              "Content-Type": "application/json",
              apikey: serviceRoleKey,
            },
            body: JSON.stringify({
              policy_name: policy.name,
              cmd: policy.cmd,
              sql: policy.sql,
            }),
          }
        );

        const result = await response.json();
        policyResults.push({ policy: policy.name, result });
      } catch (error) {
        policyResults.push({ policy: policy.name, error: error.message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        bucket: bucketResult,
        policies: policyResults,
        message: "Hero media storage setup complete!",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error setting up hero media storage:", error);
    return new Response(
      JSON.stringify({
        error: {
          code: "SETUP_ERROR",
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