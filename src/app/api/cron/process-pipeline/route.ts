import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/mail';
import { renderTemplate } from '@/lib/template-utils';
import { resolveCredentials } from '@/lib/resolve-credentials';
import { formatInTimezone } from '@/lib/timezone';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();

  const { data: pendingExecutions, error: fetchErr } = await supabase
    .from('email_pipeline_executions')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_at', now.toISOString());

  if (fetchErr || !pendingExecutions) {
    return NextResponse.json({ error: fetchErr?.message || 'No executions found', processed: 0 });
  }

  const results = { processed: 0, sent: 0, skipped: 0, failed: 0, errors: [] as string[] };

  for (const exec of pendingExecutions) {
    results.processed++;

    const { data: step } = await supabase
      .from('email_pipeline_steps')
      .select('*, email_templates(*)')
      .eq('id', exec.step_id)
      .single();

    if (!step || step.step_type !== 'send_email') {
      await supabase.from('email_pipeline_executions')
        .update({ status: 'skipped', executed_at: now.toISOString() })
        .eq('id', exec.id);
      results.skipped++;
      continue;
    }

    const template = step.email_templates;
    if (!template || !template.is_active) {
      await supabase.from('email_pipeline_executions')
        .update({ status: 'skipped', executed_at: now.toISOString() })
        .eq('id', exec.id);
      results.skipped++;
      continue;
    }

    const { data: booking } = await supabase
      .from('bookings')
      .select('*, calendars(*)')
      .eq('id', exec.booking_id)
      .eq('status', 'confirmed')
      .single();

    if (!booking) {
      await supabase.from('email_pipeline_executions')
        .update({ status: 'skipped', executed_at: now.toISOString() })
        .eq('id', exec.id);
      results.skipped++;
      continue;
    }

    const calendar = booking.calendars;

    try {
      const { smtpUser, smtpPass } = await resolveCredentials(calendar.id);
      const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/cancel/${booking.cancellation_token}`;
      const rescheduleUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reschedule/${booking.cancellation_token}`;

      const isUserTemplate = template.type.startsWith('user_');
      let recipientEmail = booking.booker_email;
      if (isUserTemplate) {
        const { data: { user: owner } } = await supabase.auth.admin.getUserById(calendar.user_id);
        recipientEmail = owner?.email || '';
      }

      if (!recipientEmail) {
        await supabase.from('email_pipeline_executions')
          .update({ status: 'failed', executed_at: now.toISOString(), error_message: 'No recipient email' })
          .eq('id', exec.id);
        results.failed++;
        continue;
      }

      const variables = {
        booker_name: booking.booker_name,
        booker_email: booking.booker_email,
        calendar_name: calendar.name,
        start_time: formatInTimezone(booking.start_time, booking.booker_timezone, 'PPPP p'),
        end_time: formatInTimezone(booking.end_time, booking.booker_timezone, 'PPPP p'),
        timezone: booking.booker_timezone,
        meet_link: booking.meet_link || 'Link will be generated',
        cancel_url: cancelUrl,
        reschedule_url: rescheduleUrl,
        google_review_url: calendar.google_review_url || '',
      };

      const subject = renderTemplate(template.subject, variables);
      const html = renderTemplate(template.body_html, variables);

      await sendEmail({ to: recipientEmail, subject, html, calendar, creds: { smtpUser, smtpPass } });

      await supabase.from('email_pipeline_executions')
        .update({ status: 'sent', executed_at: now.toISOString() })
        .eq('id', exec.id);
      results.sent++;
    } catch (err: any) {
      await supabase.from('email_pipeline_executions')
        .update({ status: 'failed', executed_at: now.toISOString(), error_message: err.message })
        .eq('id', exec.id);
      results.failed++;
      results.errors.push(`${exec.id}: ${err.message}`);
    }
  }

  // Mark completed wait steps
  await supabase
    .from('email_pipeline_executions')
    .update({ status: 'sent', executed_at: now.toISOString() })
    .eq('status', 'waiting')
    .lte('scheduled_at', now.toISOString());

  return NextResponse.json(results);
}
