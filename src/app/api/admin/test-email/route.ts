import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/mail';
import { renderTemplate, sampleVariables } from '@/lib/template-utils';
import { resolveCredentials } from '@/lib/resolve-credentials';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { calendarId, templateId, recipientEmail } = await request.json();

  if (!calendarId || !templateId || !recipientEmail) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data: calendar } = await supabase
    .from('calendars')
    .select('*')
    .eq('id', calendarId)
    .eq('user_id', user.id)
    .single();

  if (!calendar) {
    return NextResponse.json({ error: 'Calendar not found' }, { status: 404 });
  }

  const { data: template } = await supabase
    .from('email_templates')
    .select('*')
    .eq('id', templateId)
    .eq('calendar_id', calendarId)
    .single();

  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  const variables = {
    ...sampleVariables,
    calendar_name: calendar.name,
  };

  const subject = `[TEST] ${renderTemplate(template.subject, variables)}`;
  const html = renderTemplate(template.body_html, variables);

  try {
    const { smtpUser, smtpPass } = await resolveCredentials(calendarId);
    await sendEmail({
      to: recipientEmail,
      subject,
      html,
      calendar,
      creds: { smtpUser, smtpPass },
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to send test email' }, { status: 500 });
  }
}
