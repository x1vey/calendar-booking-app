import { sendResendEmail } from './resend';
import { sendSmtpEmail } from './nodemailer';
import { Calendar, EmailTemplateType } from './types';
import { createAdminClient } from './supabase/admin';
import { formatInTimezone } from './timezone';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  calendar: Calendar;
}

export async function sendEmail({ 
  to, 
  subject, 
  html, 
  calendar,
  creds
}: SendEmailOptions & { creds?: { smtpUser?: string | null, smtpPass?: string | null } }) {
  const smtpUser = creds?.smtpUser || calendar.smtp_user;
  const smtpPass = creds?.smtpPass || calendar.smtp_pass;

  if (calendar.email_provider === 'google_smtp' && smtpUser && smtpPass) {
    return sendSmtpEmail({
      to,
      subject,
      html,
      smtpUser,
      smtpPass,
    });
  }

  // Default to Resend
  return sendResendEmail({
    to,
    subject,
    html,
  });
}

export function renderTemplate(template: string, variables: Record<string, string>) {
  let rendered = template;
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(placeholder, value || '');
  }
  return rendered;
}

export async function sendBookingEmail(
  booking: {
    booker_name: string;
    booker_email: string;
    booker_timezone: string;
    start_time: string;
    end_time: string;
    meet_link?: string | null;
  },
  calendar: Calendar,
  type: EmailTemplateType,
  cancelUrl?: string,
  creds?: { smtpUser?: string | null, smtpPass?: string | null }
) {
  const supabase = createAdminClient();

  // 1. Fetch template from DB
  const { data: template } = await supabase
    .from('email_templates')
    .select('*')
    .eq('calendar_id', calendar.id)
    .eq('type', type)
    .eq('is_active', true)
    .single();

  if (!template) {
    console.warn(`No active email template found for type: ${type}`);
    return null;
  }

  // 2. Determine recipient (Host vs Client)
  let recipientEmail = booking.booker_email;
  const isUserTemplate = type.startsWith('user_');

  if (isUserTemplate) {
    const { data: { user: owner }, error: userErr } = await supabase.auth.admin.getUserById(calendar.user_id);
    if (userErr || !owner?.email) {
      console.error('Failed to fetch host email for alert:', userErr);
      return null;
    }
    recipientEmail = owner.email;
  }

  // 3. Prepare variables
  const variables = {
    booker_name: booking.booker_name,
    booker_email: booking.booker_email,
    calendar_name: calendar.name,
    start_time: formatInTimezone(booking.start_time, booking.booker_timezone, 'PPPP p'),
    end_time: formatInTimezone(booking.end_time, booking.booker_timezone, 'PPPP p'),
    timezone: booking.booker_timezone,
    meet_link: booking.meet_link || 'Link will be generated',
    cancel_url: cancelUrl || '',
  };

  // 4. Render and Send
  const subject = renderTemplate(template.subject, variables);
  const html = renderTemplate(template.body_html, variables);

  return sendEmail({
    to: recipientEmail,
    subject,
    html,
    calendar,
    creds
  });
}
