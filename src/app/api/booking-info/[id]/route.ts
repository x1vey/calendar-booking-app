import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*, calendars(*)')
    .eq('id', id)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  // Sanitize data before returning publicly
  return NextResponse.json({
    start_time: booking.start_time,
    end_time: booking.end_time,
    booker_timezone: booking.booker_timezone,
    meet_link: booking.meet_link,
    calendar: {
        name: booking.calendars?.name,
        timezone: booking.calendars?.timezone,
    }
  });
}
