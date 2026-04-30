import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code || !state || !state.startsWith('user:')) {
    return NextResponse.redirect(new URL('/dashboard/settings?error=Invalid_callback_parameters', request.url));
  }

  const userId = state.split(':')[1];
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;
  const redirectUri = process.env.ZOOM_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(new URL('/dashboard/settings?error=Internal_Zoom_configuration_error', request.url));
  }

  try {
    // Exchange the authorization code for an access token
    const tokenResponse = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Zoom Token Exchange Error:', tokenData);
      return NextResponse.redirect(new URL(`/dashboard/settings?error=Zoom_OAuth_failed`, request.url));
    }

    if (tokenData.refresh_token) {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from('user_settings')
        .update({ zoom_refresh_token: tokenData.refresh_token })
        .eq('user_id', userId);

      if (error) {
        console.error('Supabase update error (Zoom):', error);
        return NextResponse.redirect(new URL(`/dashboard/settings?error=Database_update_failed`, request.url));
      }
    }

    return NextResponse.redirect(new URL('/dashboard/settings?zoom_connected=true', request.url));
  } catch (error) {
    console.error('Zoom Callback Catch Error:', error);
    return NextResponse.redirect(new URL('/dashboard/settings?error=Unknown_error_occurred', request.url));
  }
}
