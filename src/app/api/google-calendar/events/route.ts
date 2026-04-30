import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedCalendar } from '@/lib/google-calendar';
import { subDays, addDays } from 'date-fns';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user settings for refresh token
  const { data: settings } = await supabase
    .from('user_settings')
    .select('google_refresh_token')
    .eq('user_id', user.id)
    .single();

  if (!settings?.google_refresh_token) {
    return NextResponse.json({ error: 'Google Calendar not connected', notConnected: true }, { status: 400 });
  }

  try {
    const calendar = getAuthenticatedCalendar(settings.google_refresh_token);
    
    // Fetch 20 days back and 20 days forward
    const now = new Date();
    const timeMin = subDays(now, 20).toISOString();
    const timeMax = addDays(now, 20).toISOString();

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      maxResults: 250,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items?.map(it => ({
      id: it.id,
      summary: it.summary || 'Busy',
      start: it.start?.dateTime || it.start?.date,
      end: it.end?.dateTime || it.end?.date,
      htmlLink: it.htmlLink,
      hangoutLink: it.hangoutLink,
      isAllDay: !!it.start?.date
    })) || [];

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json({ error: 'Failed to fetch events from Google.' }, { status: 500 });
  }
}
