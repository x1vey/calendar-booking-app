import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ calendarId: string }> }
) {
  const { calendarId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // First verify user owns the calendar
  const { data: calendar, error: calError } = await supabase
    .from('calendars')
    .select('id')
    .eq('id', calendarId)
    .eq('user_id', user.id)
    .single();

  if (calError || !calendar) {
    return NextResponse.json({ error: 'Calendar not found or access denied' }, { status: 404 });
  }

  const { data: templates, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('calendar_id', calendarId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Define required template types for the pipeline
  const requiredTypes = [
    'confirmation',
    'user_booking_alert',
    'client_reminder_1d',
    'client_reminder_5m',
    'user_reminder_5m',
    'cancellation',
    'reschedule_confirmation',
    'user_reschedule_alert'
  ];

  const existingTypes = templates.map(t => t.type);
  const missingTypes = requiredTypes.filter(type => !existingTypes.includes(type));

  if (missingTypes.length > 0) {
    const defaultTemplates = missingTypes.map(type => {
      let subject = 'Meeting Update';
      let body = '<p>Hello,</p><p>This is an automated notification regarding your meeting.</p>';

      if (type === 'user_booking_alert') {
        subject = 'New Booking: {{booker_name}}';
        body = '<p>You have a new booking!</p><p><strong>Booker:</strong> {{booker_name}} ({{booker_email}})</p><p><strong>Time:</strong> {{start_time}}</p>';
      } else if (type === 'client_reminder_1d') {
        subject = 'Reminder: Tomorrow - {{calendar_name}}';
        body = '<p>Hi {{booker_name}},</p><p>This is a reminder about your upcoming meeting tomorrow at {{start_time}}.</p>';
      } else if (type === 'client_reminder_5m' || type === 'user_reminder_5m') {
        subject = 'Starting in 5 min: {{calendar_name}}';
        body = '<p>The meeting is starting soon!</p><p><strong>Join here:</strong> {{meet_link}}</p>';
      } else if (type === 'reschedule_confirmation') {
        subject = 'Meeting Rescheduled: {{calendar_name}}';
        body = '<p>Hi {{booker_name}},</p><p>Your meeting has been rescheduled to <strong>{{start_time}}</strong>.</p><p><strong>New Link:</strong> {{meet_link}}</p>';
      } else if (type === 'user_reschedule_alert') {
        subject = 'Rescheduled: {{booker_name}}';
        body = '<p>A booking has been rescheduled.</p><p><strong>Booker:</strong> {{booker_name}}</p><p><strong>New Time:</strong> {{start_time}}</p>';
      }

      return {
        calendar_id: calendarId,
        type,
        subject,
        body_html: body,
        is_active: true,
        send_offset_minutes: type === 'client_reminder_1d' ? -1440 : (type.includes('5m') ? -5 : 0)
      };
    });

    const { data: seeded, error: seedError } = await supabase
      .from('email_templates')
      .insert(defaultTemplates)
      .select();

    if (!seedError && seeded) {
      return NextResponse.json([...templates, ...seeded]);
    }
  }

  return NextResponse.json(templates);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ calendarId: string }> }
) {
  // It's good practice to await it, though we don't strictly use it in PUT yet, we might need it
  const { calendarId } = await params;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json(); // Array of templates
  
  // Update each template
  const errors = [];
  for (const t of body) {
    const { error } = await supabase
      .from('email_templates')
      .update({
        subject: t.subject,
        body_html: t.body_html,
        send_offset_minutes: t.send_offset_minutes,
        is_active: t.is_active,
      })
      .eq('id', t.id);
    
    if (error) errors.push(error.message);
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(', ') }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
