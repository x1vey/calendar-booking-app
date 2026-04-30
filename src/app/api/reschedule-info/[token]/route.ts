import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*, calendars(*)')
    .eq('cancellation_token', token)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  // Sanitize data before returning publicly
  return NextResponse.json({
    id: booking.id,
    booker_name: booking.booker_name,
    booker_email: booking.booker_email,
    start_time: booking.start_time,
    end_time: booking.end_time,
    booker_timezone: booking.booker_timezone,
    calendar: booking.calendars
  });
}
