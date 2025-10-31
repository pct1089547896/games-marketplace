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

    // Call the PostgreSQL function to set up RLS policies
    const response = await fetch(
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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Function call failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Storage RLS policies configured successfully!",
        result: result
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error setting up storage RLS policies:", error);
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