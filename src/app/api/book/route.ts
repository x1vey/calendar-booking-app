import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createCalendarEvent } from '@/lib/google-calendar';
import { sendBookingEmail } from '@/lib/mail';
import { generateAvailableSlots } from '@/lib/slots';
import { v4 as uuidv4 } from 'uuid';
import { resolveCredentials } from '@/lib/resolve-credentials';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { calendarSlug, bookerName, bookerEmail, bookerTimezone, startTime, endTime, source } = body;

    const supabase = createAdminClient();

    // 1. Fetch calendar metadata (needed for name/slug)
    const { data: calendar, error: calError } = await supabase
      .from('calendars')
      .select('*')
      .eq('slug', calendarSlug)
      .single();

    if (calError || !calendar) {
      return NextResponse.json({ error: 'Calendar not found' }, { status: 404 });
    }

    // 2. Resolve credentials (global vs local)
    const { googleToken, smtpUser, smtpPass } = await resolveCredentials(calendar.id);

    // 3. Validate availability
    const dateStr = startTime.split('T')[0];
    const availableSlots = await generateAvailableSlots(calendar, dateStr, bookerTimezone, googleToken);
    const isAvailable = availableSlots.some(s => s.startTime === startTime);

    if (!isAvailable) {
      return NextResponse.json({ error: 'Slot is no longer available' }, { status: 409 });
    }

    // 4. Create Google Calendar Event
    let googleEventId = null;
    let meetLink = null;

    if (googleToken) {
      try {
        const eventRes = await createCalendarEvent(googleToken, {
          summary: `${bookerName} <> ${calendar.name}`,
          start: startTime,
          end: endTime,
          attendees: [{ email: bookerEmail }],
          timezone: calendar.timezone,
        });
        googleEventId = eventRes.eventId;
        meetLink = eventRes.meetLink;
      } catch (err) {
        console.error('Failed to create GCal event:', err);
      }
    }

    // 5. Save Booking to DB
    const cancellationToken = uuidv4();
    const { data: booking, error: bookError } = await supabase
      .from('bookings')
      .insert({
        calendar_id: calendar.id,
        booker_name: bookerName,
        booker_email: bookerEmail,
        booker_timezone: bookerTimezone,
        start_time: startTime,
        end_time: endTime,
        google_event_id: googleEventId,
        meet_link: meetLink,
        cancellation_token: cancellationToken,
        status: 'confirmed',
        source: source || null,
      })
      .select()
      .single();

    if (bookError) throw bookError;

    // 6. Send Emails
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/cancel/${cancellationToken}`;
    try {
      // A. Send Confirmation to Client
      await sendBookingEmail(booking, calendar, 'confirmation', cancelUrl, { smtpUser, smtpPass });

      // B. Send Alert to Host (User)
      const alertSent = await sendBookingEmail(booking, calendar, 'user_booking_alert', undefined, { smtpUser, smtpPass });
      
      if (alertSent) {
        await supabase
          .from('bookings')
          .update({ alert_user_sent: true })
          .eq('id', booking.id);
      }
    } catch (err) {
      console.error('Failed to send email:', err);
    }

    return NextResponse.json({ 
      booking, 
      meetLink, 
      cancelUrl 
    });

  } catch (err: any) {
    console.error('Booking error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
