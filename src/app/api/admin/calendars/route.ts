import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: calendars, error } = await supabase
    .from('calendars')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(calendars);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, slug, description, call_type, max_attendees, slot_duration_minutes, timezone } = body;

  const { data: calendar, error } = await supabase
    .from('calendars')
    .insert({
      name,
      slug,
      description,
      call_type,
      max_attendees,
      slot_duration_minutes,
      timezone,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Create default email templates
  const defaultTemplates = [
    { type: 'confirmation', subject: 'Booking Confirmed: {{calendar_name}}', body_html: '<p>Hi {{booker_name}}, your booking for {{calendar_name}} on {{start_time}} is confirmed.</p><p>Meet link: {{meet_link}}</p><p>Cancel here: {{cancel_url}}</p>' },
    { type: 'reminder', subject: 'Reminder: Booking today - {{calendar_name}}', body_html: '<p>Hi {{booker_name}}, just a reminder for our call on {{start_time}}.</p><p>Meet link: {{meet_link}}</p>', send_offset_minutes: -1440 },
    { type: 'followup', subject: 'Thanks for the call: {{calendar_name}}', body_html: '<p>Hi {{booker_name}}, thanks for joining the call. Hope you found it useful!</p>', send_offset_minutes: 60 },
    { type: 'cancellation', subject: 'Booking Cancelled: {{calendar_name}}', body_html: '<p>Hi {{booker_name}}, your booking for {{calendar_name}} on {{start_time}} has been cancelled.</p>' }
  ];

  await supabase.from('email_templates').insert(
    defaultTemplates.map(t => ({ ...t, calendar_id: calendar.id }))
  );

  return NextResponse.json(calendar);
}
