import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Removed revalidate to ensure instant updates for the user during landing page editing
export const dynamic = 'force-dynamic';
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

  const { data: userSettings } = await supabase
    .from('user_settings')
    .select('avatar_url, about_me, display_name')
    .eq('user_id', calendar.user_id)
    .single();



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
    
    // Landing Page Customization
    landing_page_enabled: calendar.landing_page_enabled ?? true,
    hide_branding: calendar.hide_branding ?? false,
    heading_text: calendar.heading_text,
    subheading_text: calendar.subheading_text,
    hero_image_url: calendar.hero_image_url,
    theme_bg_color: calendar.theme_bg_color || '#f8fafc',
    theme_text_color: calendar.theme_text_color || '#0f172a',
    theme_heading_color: calendar.theme_heading_color || '#0f172a',
    theme_subheading_color: calendar.theme_subheading_color || '#64748b',
    testimonial_headline: calendar.testimonial_headline,
    cta_button_text: calendar.cta_button_text || 'Book Now',
    expectations_headline: calendar.expectations_headline,
    expectations_body: calendar.expectations_body,
    google_place_id: calendar.google_place_id,
    
    youtube_video_url: calendar.youtube_video_url,
    testimonial_videos: calendar.testimonial_videos || [],
    google_review_url: calendar.google_review_url, // keeping for backward compat
    privacy_url: calendar.privacy_url,
    terms_url: calendar.terms_url,

    // Profile Settings
    avatar_url: userSettings?.avatar_url,
    about_me: userSettings?.about_me,
    display_name: userSettings?.display_name,
    // Explicitly exclude: google_refresh_token, smtp_user, smtp_pass
  });
}
