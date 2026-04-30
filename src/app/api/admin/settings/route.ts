import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Build the update object dynamically — only include fields that were sent
    const updateData: Record<string, any> = {
      user_id: user.id,
      updated_at: new Date().toISOString()
    };

    if ('smtp_user' in body) updateData.smtp_user = body.smtp_user;
    if ('smtp_pass' in body) updateData.smtp_pass = body.smtp_pass;
    if ('google_refresh_token' in body) updateData.google_refresh_token = body.google_refresh_token;
    if ('zoom_refresh_token' in body) updateData.zoom_refresh_token = body.zoom_refresh_token;
    if ('microsoft_refresh_token' in body) updateData.microsoft_refresh_token = body.microsoft_refresh_token;
    if ('slack_webhook_url' in body) updateData.slack_webhook_url = body.slack_webhook_url;
    if ('avatar_url' in body) updateData.avatar_url = body.avatar_url;
    if ('about_me' in body) updateData.about_me = body.about_me;
    if ('display_name' in body) updateData.display_name = body.display_name;
    if ('notification_email' in body) updateData.notification_email = body.notification_email;

    const { error } = await supabase
      .from('user_settings')
      .upsert(updateData);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
