import { NextRequest, NextResponse } from 'next/server';
import { generateAvailableSlots } from '@/lib/slots';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get('date'); // YYYY-MM-DD
  const timezone = searchParams.get('timezone') || 'UTC';

  if (!date) {
    return NextResponse.json({ error: 'Date is required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Fetch calendar
  const { data: calendar, error } = await supabase
    .from('calendars')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !calendar) {
    return NextResponse.json({ error: 'Calendar not found' }, { status: 404 });
  }

  if (!calendar.is_active) {
    return NextResponse.json({ error: 'Calendar is inactive' }, { status: 403 });
  }

  // Resolve Google token from user's account settings
  let googleToken: string | null = null;

  // AUTO-HEAL: If user_id is missing (pre-migration calendar), try to find
  // the owner by checking who has a user_settings row, and patch the calendar
  if (!calendar.user_id) {
    const { data: anySettings } = await supabase
      .from('user_settings')
      .select('user_id, google_refresh_token')
      .not('google_refresh_token', 'is', null)
      .limit(1)
      .single();

    if (anySettings) {
      await supabase.from('calendars').update({ user_id: anySettings.user_id }).eq('id', calendar.id);
      calendar.user_id = anySettings.user_id;
      googleToken = anySettings.google_refresh_token;
    }
  } else {
    const { data: userSettings } = await supabase
      .from('user_settings')
      .select('google_refresh_token')
      .eq('user_id', calendar.user_id)
      .single();

    googleToken = userSettings?.google_refresh_token || null;
  }

  try {
    const slots = await generateAvailableSlots(calendar, date, timezone, googleToken);
    return NextResponse.json({ slots });
  } catch (err: any) {
    console.error('Slot generation error:', err);
    return NextResponse.json({ error: 'Failed to generate slots' }, { status: 500 });
  }
}
