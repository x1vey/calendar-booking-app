import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { deleteCalendarEvent, createCalendarEvent } from '@/lib/google-calendar';
import { sendBookingEmail } from '@/lib/mail';
import { generateAvailableSlots } from '@/lib/slots';
import { resolveCredentials } from '@/lib/resolve-credentials';

export async function POST(request: NextRequest) {
  try {
    const { token, startTime, endTime } = await request.json();

    if (!token || !startTime || !endTime) {
      return NextResponse.json({ error: 'Token and new times are required' }, { status: 400 });
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
      return NextResponse.json({ error: 'Cannot reschedule a cancelled booking' }, { status: 400 });
    }

    const calendar = booking.calendars;

    // 2. Resolve credentials (global vs local)
    const { googleToken, smtpUser, smtpPass } = await resolveCredentials(calendar.id);

    // 3. Validate availability for the NEW slot
    const dateStr = startTime.split('T')[0];
    const availableSlots = await generateAvailableSlots(calendar, dateStr, booking.booker_timezone, googleToken);
    const isAvailable = availableSlots.some(s => s.startTime === startTime);

    if (!isAvailable) {
      return NextResponse.json({ error: 'The selected slot is no longer available' }, { status: 409 });
    }

    // 4. Delete OLD event
    if (booking.google_event_id && googleToken) {
      try {
        await deleteCalendarEvent(googleToken, booking.google_event_id);
      } catch (err) {
        console.error('Failed to delete old GCal event:', err);
      }
    }

    // 5. Create NEW event & Meeting Link
    let googleEventId = null;
    let finalMeetingLink = null;
    let useMeet = false;

    // A. Handle Zoom if configured
    if (calendar.meeting_provider === 'zoom') {
      try {
        const { createZoomMeeting } = await import('@/lib/zoom');
        const start = new Date(startTime);
        const end = new Date(endTime);
        const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));

        const zoomRes = await createZoomMeeting(calendar.user_id, {
          topic: `(RESCHEDULED) ${booking.booker_name} <> ${calendar.name}`,
          startTime: startTime,
          duration: duration,
          timezone: calendar.timezone
        });
        finalMeetingLink = zoomRes.join_url;
      } catch (err) {
        console.error('Failed to create Zoom meeting for reschedule:', err);
      }
    }

    // B. Handle Google Calendar & potentially Google Meet
    if (googleToken) {
      try {
        useMeet = calendar.meeting_provider === 'google_meet' || (!calendar.meeting_provider && !finalMeetingLink);
        
        const eventRes = await createCalendarEvent(googleToken, {
          summary: `(RESCHEDULED) ${booking.booker_name} <> ${calendar.name}`,
          start: startTime,
          end: endTime,
          attendees: [{ email: booking.booker_email }],
          timezone: calendar.timezone,
          location: finalMeetingLink || undefined,
          description: finalMeetingLink ? `Zoom Meeting: ${finalMeetingLink}` : undefined,
          useMeet: useMeet
        });
        
        googleEventId = eventRes.eventId;
        if (!finalMeetingLink) {
          finalMeetingLink = eventRes.meetLink;
        }
      } catch (err) {
        console.error('Failed to create GCal event for reschedule:', err);
      }
    }

    // 6. Update Booking in DB
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        start_time: startTime,
        end_time: endTime,
        google_event_id: googleEventId,
        meet_link: finalMeetingLink,
        reminder_sent: false, // Reset reminders for the new time
        rem_1d_client_sent: false,
        rem_5m_client_sent: false,
        rem_5m_user_sent: false,
        alert_user_sent: false,
        followup_sent: false,
        review_request_sent: false
      })
      .eq('id', booking.id);

    if (updateError) throw updateError;

    // 7. Send Reschedule Emails
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    const cancelUrl = `${baseUrl}/cancel/${booking.cancellation_token}`;
    const rescheduleUrl = `${baseUrl}/reschedule/${booking.cancellation_token}`;

    try {
      // client confirmation
      await sendBookingEmail(booking, calendar, 'reschedule_confirmation', cancelUrl, rescheduleUrl, { smtpUser, smtpPass });
      // host alert
      await sendBookingEmail(booking, calendar, 'user_reschedule_alert', cancelUrl, rescheduleUrl, { smtpUser, smtpPass });
    } catch (err) {
      console.error('Failed to send reschedule emails:', err);
    }

    return NextResponse.json({ success: true, message: 'Rescheduled successfully' });

  } catch (err: any) {
    console.error('Reschedule error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
