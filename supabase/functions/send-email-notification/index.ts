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
    const { userId, notificationType, title, message, link } = await req.json();

    if (!userId || !notificationType || !title || !message) {
      throw new Error('Missing required parameters');
    }

    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');

    if (!serviceRoleKey || !supabaseUrl) {
      throw new Error('Supabase configuration missing');
    }

    // Check user's notification preferences
    const preferencesResponse = await fetch(
      `${supabaseUrl}/rest/v1/notification_preferences?user_id=eq.${userId}&select=email_notifications`,
      {
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!preferencesResponse.ok) {
      throw new Error('Failed to fetch notification preferences');
    }

    const preferences = await preferencesResponse.json();
    
    // If user has disabled email notifications, skip
    if (preferences.length > 0 && !preferences[0].email_notifications) {
      return new Response(JSON.stringify({
        data: { message: 'Email notifications disabled for user' }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get user email
    const userResponse = await fetch(
      `${supabaseUrl}/auth/v1/admin/users/${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey
        }
      }
    );

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data');
    }

    const userData = await userResponse.json();
    const userEmail = userData.email;

    if (!userEmail) {
      throw new Error('User email not found');
    }

    // Insert notification into database
    const notificationResponse = await fetch(
      `${supabaseUrl}/rest/v1/notifications`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          user_id: userId,
          type: notificationType,
          title: title,
          message: message,
          link: link || null,
          is_read: false
        })
      }
    );

    if (!notificationResponse.ok) {
      const errorText = await notificationResponse.text();
      throw new Error(`Failed to create notification: ${errorText}`);
    }

    const notificationData = await notificationResponse.json();

    // Here you would integrate with an email service like SendGrid, Resend, etc.
    // For now, we'll log the email that would be sent
    console.log('Email notification would be sent to:', userEmail);
    console.log('Subject:', title);
    console.log('Message:', message);
    console.log('Link:', link);

    return new Response(JSON.stringify({
      data: {
        success: true,
        notification: notificationData[0],
        emailSent: false, // Set to true when actual email service is integrated
        message: 'Notification created successfully'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Email notification error:', error);

    const errorResponse = {
      error: {
        code: 'EMAIL_NOTIFICATION_FAILED',
        message: error.message
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
