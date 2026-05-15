import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const DEFAULT_PIPELINES = [
  {
    trigger_event: 'booking_confirmed',
    name: 'Booking Confirmed',
    steps: [
      { step_order: 0, step_type: 'send_email', template_type: 'confirmation' },
      { step_order: 1, step_type: 'send_email', template_type: 'user_booking_alert' },
      { step_order: 2, step_type: 'wait', wait_duration_minutes: 1440, wait_anchor: 'before_event' },
      { step_order: 3, step_type: 'send_email', template_type: 'client_reminder_1d' },
      { step_order: 4, step_type: 'wait', wait_duration_minutes: 5, wait_anchor: 'before_event' },
      { step_order: 5, step_type: 'send_email', template_type: 'client_reminder_5m' },
      { step_order: 6, step_type: 'send_email', template_type: 'user_reminder_5m' },
    ],
  },
  {
    trigger_event: 'booking_cancelled',
    name: 'Booking Cancelled',
    steps: [
      { step_order: 0, step_type: 'send_email', template_type: 'cancellation' },
    ],
  },
];

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

  const { data: calendar } = await supabase
    .from('calendars')
    .select('id')
    .eq('id', calendarId)
    .eq('user_id', user.id)
    .single();

  if (!calendar) {
    return NextResponse.json({ error: 'Calendar not found' }, { status: 404 });
  }

  const { data: pipelines } = await supabase
    .from('email_pipelines')
    .select('*, email_pipeline_steps(*, email_templates(*))')
    .eq('calendar_id', calendarId)
    .order('trigger_event');

  if (pipelines && pipelines.length > 0) {
    const formatted = pipelines.map(p => ({
      ...p,
      steps: (p.email_pipeline_steps || [])
        .sort((a: any, b: any) => a.step_order - b.step_order)
        .map((s: any) => ({
          ...s,
          email_template: s.email_templates || null,
          email_templates: undefined,
        })),
      email_pipeline_steps: undefined,
    }));
    return NextResponse.json(formatted);
  }

  // Auto-seed default pipelines
  const { data: templates } = await supabase
    .from('email_templates')
    .select('id, type')
    .eq('calendar_id', calendarId);

  const templateMap = new Map((templates || []).map(t => [t.type, t.id]));

  const seededPipelines = [];
  for (const def of DEFAULT_PIPELINES) {
    const { data: pipeline, error: pErr } = await supabase
      .from('email_pipelines')
      .insert({
        calendar_id: calendarId,
        trigger_event: def.trigger_event,
        name: def.name,
      })
      .select()
      .single();

    if (pErr || !pipeline) continue;

    const stepsToInsert = def.steps
      .map(s => ({
        pipeline_id: pipeline.id,
        step_order: s.step_order,
        step_type: s.step_type,
        email_template_id: s.template_type ? (templateMap.get(s.template_type) || null) : null,
        wait_duration_minutes: s.wait_duration_minutes || null,
        wait_anchor: s.wait_anchor || null,
      }));

    const { data: steps } = await supabase
      .from('email_pipeline_steps')
      .insert(stepsToInsert)
      .select('*, email_templates(*)');

    seededPipelines.push({
      ...pipeline,
      steps: (steps || []).map((s: any) => ({
        ...s,
        email_template: s.email_templates || null,
        email_templates: undefined,
      })),
    });
  }

  return NextResponse.json(seededPipelines);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ calendarId: string }> }
) {
  const { calendarId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: calendar } = await supabase
    .from('calendars')
    .select('id')
    .eq('id', calendarId)
    .eq('user_id', user.id)
    .single();

  if (!calendar) {
    return NextResponse.json({ error: 'Calendar not found' }, { status: 404 });
  }

  const body = await request.json();
  const errors: string[] = [];

  for (const pipeline of body) {
    const { error: pErr } = await supabase
      .from('email_pipelines')
      .update({
        name: pipeline.name,
        is_active: pipeline.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', pipeline.id);

    if (pErr) {
      errors.push(pErr.message);
      continue;
    }

    await supabase
      .from('email_pipeline_steps')
      .delete()
      .eq('pipeline_id', pipeline.id);

    if (pipeline.steps && pipeline.steps.length > 0) {
      const stepsToInsert = pipeline.steps.map((s: any, i: number) => ({
        pipeline_id: pipeline.id,
        step_order: i,
        step_type: s.step_type,
        email_template_id: s.email_template_id || null,
        wait_duration_minutes: s.wait_duration_minutes || null,
        wait_anchor: s.wait_anchor || null,
      }));

      const { error: sErr } = await supabase
        .from('email_pipeline_steps')
        .insert(stepsToInsert);

      if (sErr) errors.push(sErr.message);
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(', ') }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
