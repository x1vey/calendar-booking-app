import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { deleteCalendarEvent } from '@/lib/google-calendar';
import { sendBookingEmail } from '@/lib/mail';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Fetch booking with calendar
    const { data: booking, error: bookError } = await supabase
      .from('bookings')
      .select('*, calendars(*)')
      .eq('cancellation_token', token)
      .single();

    if (bookError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status === 'cancelled') {
       return NextResponse.json({ message: 'Booking already cancelled' });
    }

    // 2. Update status in DB
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', booking.id);

    if (updateError) throw updateError;

    // 3. Delete GCal event using account-level Google token
    const calendar = booking.calendars;
    if (booking.google_event_id && calendar.user_id) {
      const { data: userSettings } = await supabase
        .from('user_settings')
        .select('google_refresh_token')
        .eq('user_id', calendar.user_id)
        .single();

      const googleToken = userSettings?.google_refresh_token;
      if (googleToken) {
        try {
          await deleteCalendarEvent(googleToken, booking.google_event_id);
        } catch (err) {
          console.error('Failed to delete GCal event:', err);
        }
      }
    }

    // 4. Send cancellation email
    try {
      await sendBookingEmail(booking, calendar, 'cancellation');
    } catch (err) {
      console.error('Failed to send cancellation email:', err);
    }

    return NextResponse.json({ success: true, message: 'Booking cancelled successfully' });

  } catch (err: any) {
    console.error('Cancellation error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
