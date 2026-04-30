import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendBookingEmail } from '@/lib/mail';
import { addMinutes, isBefore, isAfter } from 'date-fns';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();

  // 1. Reminders
  // Find bookings where status = confirmed AND reminder_sent = false
  const { data: reminderBookings } = await supabase
    .from('bookings')
    .select('*, calendars(*)')
    .eq('status', 'confirmed')
    .eq('reminder_sent', false);

  let reminderCount = 0;
  if (reminderBookings) {
    for (const booking of reminderBookings) {
      // Fetch the reminder template for this calendar
      const { data: template } = await supabase
        .from('email_templates')
        .select('*')
        .eq('calendar_id', booking.calendar_id)
        .eq('type', 'reminder')
        .eq('is_active', true)
        .single();

      if (template) {
        // template.send_offset_minutes is e.g. -1440
        const triggerTime = addMinutes(new Date(booking.start_time), template.send_offset_minutes);
        
        if (isBefore(triggerTime, now)) {
          await sendBookingEmail(booking, booking.calendars, 'reminder');
          await supabase.from('bookings').update({ reminder_sent: true }).eq('id', booking.id);
          reminderCount++;
        }
      }
    }
  }

  // 2. Follow-ups
  const { data: followupBookings } = await supabase
    .from('bookings')
    .select('*, calendars(*)')
    .eq('status', 'confirmed')
    .eq('followup_sent', false);

  let followupCount = 0;
  if (followupBookings) {
    for (const booking of followupBookings) {
      const { data: template } = await supabase
        .from('email_templates')
        .select('*')
        .eq('calendar_id', booking.calendar_id)
        .eq('type', 'followup')
        .eq('is_active', true)
        .single();

      if (template) {
        // template.send_offset_minutes is e.g. 60
        const triggerTime = addMinutes(new Date(booking.end_time), template.send_offset_minutes);

        if (isBefore(triggerTime, now)) {
          await sendBookingEmail(booking, booking.calendars, 'followup');
          await supabase.from('bookings').update({ followup_sent: true }).eq('id', booking.id);
          followupCount++;
        }
      }
    }
  }

  // 3. Review Requests
  const { data: reviewBookings } = await supabase
    .from('bookings')
    .select('*, calendars(*)')
    .eq('status', 'confirmed')
    .eq('review_request_sent', false);

  let reviewCount = 0;
  if (reviewBookings) {
    for (const booking of reviewBookings) {
      // Only process if the calendar actually has a Google Review URL set
      if (!booking.calendars?.google_review_url) continue;

      const { data: template } = await supabase
        .from('email_templates')
        .select('*')
        .eq('calendar_id', booking.calendar_id)
        .eq('type', 'review_request')
        .eq('is_active', true)
        .single();

      if (template) {
        // e.g., send_offset_minutes = 30 means 30 min after call ends
        const triggerTime = addMinutes(new Date(booking.end_time), template.send_offset_minutes);

        if (isBefore(triggerTime, now)) {
          await sendBookingEmail(booking, booking.calendars, 'review_request');
          await supabase.from('bookings').update({ review_request_sent: true }).eq('id', booking.id);
          reviewCount++;
        }
      }
    }
  }

  return NextResponse.json({
    success: true,
    remindersSent: reminderCount,
    followupsSent: followupCount,
    reviewsSent: reviewCount
  });
}
