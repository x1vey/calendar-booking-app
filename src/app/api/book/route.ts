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

    // 4. Create Meeting Link (Zoom or Google Meet)
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
          topic: `${bookerName} <> ${calendar.name}`,
          startTime: startTime,
          duration: duration,
          timezone: calendar.timezone
        });
        finalMeetingLink = zoomRes.join_url;
      } catch (err) {
        console.error('Failed to create Zoom meeting:', err);
      }
    } else if (calendar.meeting_provider === 'ms_teams') {
      try {
        const { createTeamsMeeting } = await import('@/lib/microsoft');
        const teamsRes = await createTeamsMeeting(calendar.user_id, {
          subject: `${bookerName} <> ${calendar.name}`,
          startTime: startTime,
          endTime: endTime,
        });
        finalMeetingLink = teamsRes.joinUrl;
      } catch (err) {
        console.error('Failed to create Teams meeting:', err);
      }
    }

    // B. Handle Primary Calendar Event (Google/Outlook)
    if (calendar.calendar_sync_provider === 'outlook') {
      try {
        const { createOutlookEvent } = await import('@/lib/microsoft');
        await createOutlookEvent(calendar.user_id, {
          subject: `${bookerName} <> ${calendar.name}`,
          startTime: startTime,
          endTime: endTime,
          location: finalMeetingLink || undefined,
          description: finalMeetingLink ? `Meeting Link: ${finalMeetingLink}` : undefined,
        });
      } catch (err) {
        console.error('Failed to create Outlook event:', err);
      }
    } else if (googleToken) {
      try {
        // Only use Google's native Meet if Zoom/Teams weren't explicitly requested or failed
        useMeet = calendar.meeting_provider === 'google_meet' || (!calendar.meeting_provider && !finalMeetingLink);
        
        const eventRes = await createCalendarEvent(googleToken, {
          summary: `${bookerName} <> ${calendar.name}`,
          start: startTime,
          end: endTime,
          attendees: [{ email: bookerEmail }],
          timezone: calendar.timezone,
          location: finalMeetingLink || undefined, // Inject external link into GCal location
          description: finalMeetingLink ? `Meeting Link: ${finalMeetingLink}` : undefined,
          useMeet: useMeet
        });
        
        googleEventId = eventRes.eventId;
        // If we didn't use an external provider, we use the generated Meet link
        if (!finalMeetingLink) {
          finalMeetingLink = eventRes.meetLink;
        }
      } catch (err) {
        console.error('Failed to create GCal event:', err);
      }
    }

    const meetLink = finalMeetingLink;

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
    const rescheduleUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reschedule/${cancellationToken}`;
    try {
      // A. Send Confirmation to Client
      await sendBookingEmail(booking, calendar, 'confirmation', cancelUrl, rescheduleUrl, { smtpUser, smtpPass });

      // B. Send Alert to Host (User)
      const alertSent = await sendBookingEmail(booking, calendar, 'user_booking_alert', cancelUrl, rescheduleUrl, { smtpUser, smtpPass });
      
      if (alertSent) {
        await supabase
          .from('bookings')
          .update({ alert_user_sent: true })
          .eq('id', booking.id);
      }
    } catch (err) {
      console.error('Failed to send email:', err);
    }

    // 7. Send Slack and WhatsApp Notifications
    try {
      const { data: userSettings } = await supabase
        .from('user_settings')
        .select('slack_webhook_url, whatsapp_enabled, twilio_account_sid, twilio_auth_token')
        .eq('user_id', calendar.user_id)
        .single();
        
      if (userSettings?.slack_webhook_url) {
        const { sendSlackNotification } = await import('@/lib/slack');
        await sendSlackNotification(userSettings.slack_webhook_url, booking);
      }
      
      // Note: WhatsApp logic would go here
    } catch (err) {
      console.error('Failed integrations:', err);
    }

    return NextResponse.json({ 
      booking, 
      meetLink, 
      cancelUrl,
      rescheduleUrl
    });

  } catch (err: any) {
    console.error('Booking error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
