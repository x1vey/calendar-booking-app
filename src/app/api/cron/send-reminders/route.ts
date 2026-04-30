import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendBookingEmail } from '@/lib/mail';
import { resolveCredentials } from '@/lib/resolve-credentials';
import { addMinutes, addDays, isBefore, isAfter } from 'date-fns';

export async function GET(request: NextRequest) {
  // 0. Auth check (Cron Secret)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();

  // 1. Fetch upcoming confirmed bookings
  // We look ahead up to 25 hours to catch anything in the windows
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*, calendars(*)')
    .eq('status', 'confirmed')
    .gt('start_time', now.toISOString())
    .lt('start_time', addDays(now, 2).toISOString());

  if (error || !bookings) {
    return NextResponse.json({ error: error?.message || 'No bookings found' }, { status: 500 });
  }

  const results = {
    processed: bookings.length,
    sent_24h_client: 0,
    sent_5m_client: 0,
    sent_5m_user: 0,
    errors: [] as string[]
  };

  for (const booking of bookings) {
    const startTime = new Date(booking.start_time);
    const calendar = booking.calendars;

    // Resolve credentials once per calendar if needed, but here we can just use defaults or pass them
    // For simplicity, we'll let sendBookingEmail handle its own credential resolution if needed, 
    // but better yet, we can resolve them here to be efficient.
    const { smtpUser, smtpPass } = await resolveCredentials(calendar.id);
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/cancel/${booking.cancellation_token}`;

    // --- CASE A: 1-Day Client Reminder ---
    // Trigger if session is exactly in the [24h, 23h50m] window before start
    const trigger24h = addDays(now, 1);
    if (!booking.rem_1d_client_sent && isAfter(trigger24h, startTime)) {
      try {
        const sent = await sendBookingEmail(booking, calendar, 'client_reminder_1d', cancelUrl, undefined, { smtpUser, smtpPass });
        if (sent) {
          await supabase.from('bookings').update({ rem_1d_client_sent: true }).eq('id', booking.id);
          results.sent_24h_client++;
        }
      } catch (e: any) {
        results.errors.push(`24h Client (${booking.id}): ${e.message}`);
      }
    }

    // --- CASE B: 5-Min Client Reminder ---
    const trigger5m = addMinutes(now, 6); // Look slightly ahead to catch it
    if (!booking.rem_5m_client_sent && isAfter(trigger5m, startTime)) {
      try {
        const sent = await sendBookingEmail(booking, calendar, 'client_reminder_5m', cancelUrl, undefined, { smtpUser, smtpPass });
        if (sent) {
          await supabase.from('bookings').update({ rem_5m_client_sent: true }).eq('id', booking.id);
          results.sent_5m_client++;
        }
      } catch (e: any) {
        results.errors.push(`5m Client (${booking.id}): ${e.message}`);
      }
    }

    // --- CASE C: 5-Min User (Host) Reminder ---
    if (!booking.rem_5m_user_sent && isAfter(trigger5m, startTime)) {
      try {
        const sent = await sendBookingEmail(booking, calendar, 'user_reminder_5m', undefined, undefined, { smtpUser, smtpPass });
        if (sent) {
          await supabase.from('bookings').update({ rem_5m_user_sent: true }).eq('id', booking.id);
          results.sent_5m_user++;
        }
      } catch (e: any) {
        results.errors.push(`5m User (${booking.id}): ${e.message}`);
      }
    }
  }

  return NextResponse.json(results);
}
