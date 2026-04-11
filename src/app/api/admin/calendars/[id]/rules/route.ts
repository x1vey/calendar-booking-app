import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: rules, error } = await supabase
    .from('slot_rules')
    .select('*')
    .eq('calendar_id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(rules || []);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Ensure calendar exists
  const { data: calendar, error: calError } = await supabase
    .from('calendars')
    .select('id, user_id')
    .eq('id', id)
    .single();

  if (calError || !calendar) {
    return NextResponse.json({ error: `Calendar not found or unauthorized: ${calError?.message || 'No calendar matched'}` }, { status: 403 });
  }

  // AUTO-HEAL: If this old calendar has a null user_id (due to recent schema updates),
  // assign it to the current admin user automatically so Google Sync and routing works.
  if (!calendar.user_id || calendar.user_id !== user.id) {
    await supabase.from('calendars').update({ user_id: user.id }).eq('id', id);
  }

  const rules = await request.json();

  // First, delete all existing rules for this calendar
  const { error: deleteError } = await supabase
    .from('slot_rules')
    .delete()
    .eq('calendar_id', id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  // Then insert the new rules
  if (rules && rules.length > 0) {
    const rulesToInsert = rules.map((r: any) => ({
      calendar_id: id,
      day_of_week: r.day_of_week,
      start_time: r.start_time,
      end_time: r.end_time
    }));

    const { error: insertError } = await supabase
      .from('slot_rules')
      .insert(rulesToInsert);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
