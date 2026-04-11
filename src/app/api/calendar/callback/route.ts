import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/google-calendar';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state') || '';
  const [type, id] = state.split(':');

  if (!code || !state) {
    return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const supabase = createAdminClient();
    
    if (type === 'user') {
        const { error } = await supabase
          .from('user_settings')
          .upsert({ 
            user_id: id, 
            google_refresh_token: tokens.refresh_token,
            updated_at: new Date().toISOString()
          });
        if (error) throw error;
        return NextResponse.redirect(new URL(`/dashboard/settings?connected=true`, request.url));
    } else {
        const { error } = await supabase
          .from('calendars')
          .update({ google_refresh_token: tokens.refresh_token })
          .eq('id', id);
        if (error) throw error;
        return NextResponse.redirect(new URL(`/dashboard/calendar/${id}?connected=true`, request.url));
    }
  } catch (err: any) {
    console.error('OAuth callback error:', err);
    const redirectPath = type === 'user' ? '/dashboard/settings' : `/dashboard/calendar/${id}`;
    return NextResponse.redirect(new URL(`${redirectPath}?error=oauth_failed`, request.url));
  }
}
