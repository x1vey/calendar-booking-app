import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: calendar, error } = await supabase
    .from('calendars')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !calendar) {
    return NextResponse.json({ error: 'Calendar not found' }, { status: 404 });
  }

  // Return public-safe fields only (exclude tokens/secrets)
  return NextResponse.json({
    id: calendar.id,
    name: calendar.name,
    slug: calendar.slug,
    description: calendar.description,
    call_type: calendar.call_type,
    max_attendees: calendar.max_attendees,
    slot_duration_minutes: calendar.slot_duration_minutes,
    is_active: calendar.is_active,
    timezone: calendar.timezone,
    created_at: calendar.created_at,
    // These are needed internally but not sensitive
    user_id: calendar.user_id,
    use_global_settings: calendar.use_global_settings,
    email_provider: calendar.email_provider,
    // Explicitly exclude: google_refresh_token, smtp_user, smtp_pass
  });
}
