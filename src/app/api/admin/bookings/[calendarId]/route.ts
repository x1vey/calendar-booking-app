import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ calendarId: string }> }
) {
  const { calendarId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // First verify user owns the calendar
  const { data: calendar, error: calError } = await supabase
    .from('calendars')
    .select('id')
    .eq('id', calendarId)
    .eq('user_id', user.id)
    .single();

  if (calError || !calendar) {
    return NextResponse.json({ error: 'Calendar not found or access denied' }, { status: 404 });
  }

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('calendar_id', calendarId)
    .order('start_time', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(bookings);
}
