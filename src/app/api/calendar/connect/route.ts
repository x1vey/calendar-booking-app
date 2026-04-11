import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/google-calendar';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const calendarId = request.nextUrl.searchParams.get('calendarId');
  const userId = request.nextUrl.searchParams.get('userId');

  if (!calendarId && !userId) {
    return NextResponse.json({ error: 'calendarId or userId is required' }, { status: 400 });
  }

  const state = calendarId ? `cal:${calendarId}` : `user:${userId}`;
  const authUrl = getAuthUrl(state);
  return NextResponse.redirect(authUrl);
}
