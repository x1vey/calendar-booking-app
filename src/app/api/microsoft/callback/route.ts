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
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  const redirectUri = process.env.MICROSOFT_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(new URL('/dashboard/settings?error=Internal_Microsoft_configuration_error', request.url));
  }

  try {
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Microsoft Token Exchange Error:', tokenData);
      return NextResponse.redirect(new URL(`/dashboard/settings?error=Microsoft_OAuth_failed`, request.url));
    }

    if (tokenData.refresh_token) {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from('user_settings')
        .update({ microsoft_refresh_token: tokenData.refresh_token })
        .eq('user_id', userId);

      if (error) {
        console.error('Supabase update error (Microsoft):', error);
        return NextResponse.redirect(new URL(`/dashboard/settings?error=Database_update_failed`, request.url));
      }
    }

    return NextResponse.redirect(new URL('/dashboard/settings?microsoft_connected=true', request.url));
  } catch (error) {
    console.error('Microsoft Callback Catch Error:', error);
    return NextResponse.redirect(new URL('/dashboard/settings?error=Unknown_error_occurred', request.url));
  }
}
