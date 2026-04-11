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

    const { error } = await supabase
      .from('user_settings')
      .upsert(updateData);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
