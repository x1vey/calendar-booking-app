import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { deleteCalendarEvent } from '@/lib/google-calendar';
import { sendBookingEmail } from '@/lib/mail';
import { calculateExecutionSchedule } from '@/lib/pipeline';

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

    // 4. Skip pending pipeline executions for this booking
    await supabase
      .from('email_pipeline_executions')
      .update({ status: 'skipped', executed_at: new Date().toISOString() })
      .eq('booking_id', booking.id)
      .in('status', ['pending', 'waiting']);

    // 5. Send cancellation email (pipeline or legacy)
    const { data: cancelPipeline } = await supabase
      .from('email_pipelines')
      .select('*, email_pipeline_steps(*)')
      .eq('calendar_id', calendar.id)
      .eq('trigger_event', 'booking_cancelled')
      .eq('is_active', true)
      .single();

    if (cancelPipeline && cancelPipeline.email_pipeline_steps?.length > 0) {
      const executions = calculateExecutionSchedule(
        cancelPipeline.email_pipeline_steps,
        new Date(),
        new Date(booking.start_time)
      );

      if (executions.length > 0) {
        await supabase.from('email_pipeline_executions').insert(
          executions.map(e => ({
            booking_id: booking.id,
            pipeline_id: cancelPipeline.id,
            step_id: e.stepId,
            status: e.status,
            scheduled_at: e.scheduledAt,
          }))
        );
      }
    } else {
      try {
        await sendBookingEmail(booking, calendar, 'cancellation');
      } catch (err) {
        console.error('Failed to send cancellation email:', err);
      }
    }

    return NextResponse.json({ success: true, message: 'Booking cancelled successfully' });

  } catch (err: any) {
    console.error('Cancellation error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
