import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

/**
 * PATCH /api/business/me
 * ─────────────────────
 * Updates calendar-level settings for the authenticated user's primary calendar.
 * Currently supports: calendar_theme, accent_color.
 *
 * Body: { calendar_theme?: string; accent_color?: string }
 *
 * Note: This targets the user's first calendar (matching the existing single-
 * calendar UX). Extend to accept a calendar_id param when multi-calendar is live.
 */
export async function PATCH(request: NextRequest) {
  try {
    // ── Auth ───────────────────────────────────────────────────────────────
    const supabaseUser = await createClient();
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const allowedFields = ['calendar_theme', 'accent_color'] as const;

    // Build a safe update payload — only whitelisted fields
    const updatePayload: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updatePayload[field] = body[field];
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // ── Find user's calendar ────────────────────────────────────────────────
    const { data: calendar, error: calError } = await supabase
      .from('calendars')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (calError || !calendar) {
      return NextResponse.json({ error: 'No calendar found for this account' }, { status: 404 });
    }

    // ── Update ─────────────────────────────────────────────────────────────
    const { data: updated, error: updateError } = await supabase
      .from('calendars')
      .update({ ...updatePayload, updated_at: new Date().toISOString() })
      .eq('id', calendar.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, calendar: updated });

  } catch (err: any) {
    console.error('[PATCH /api/business/me]', err);
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/business/me
 * ─────────────────────
 * Returns the authenticated user's primary calendar settings.
 */
export async function GET() {
  try {
    const supabaseUser = await createClient();
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();

    const { data: calendar, error } = await supabase
      .from('calendars')
      .select('id, slug, name, calendar_theme, accent_color, is_active')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (error || !calendar) {
      return NextResponse.json({ error: 'No calendar found' }, { status: 404 });
    }

    return NextResponse.json(calendar);

  } catch (err: any) {
    console.error('[GET /api/business/me]', err);
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 });
  }
}
