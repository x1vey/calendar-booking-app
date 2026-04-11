import { createAdminClient } from './supabase/admin';

export async function resolveCredentials(calendarId: string) {
  const supabase = createAdminClient();

  // 1. Fetch the calendar
  const { data: calendar, error: calError } = await supabase
    .from('calendars')
    .select('*')
    .eq('id', calendarId)
    .single();

  if (calError || !calendar) {
    throw new Error('Calendar not found');
  }

  let userSettings: any = null;

  // 2. AUTO-HEAL: If user_id is missing (pre-migration calendar), discover the owner
  if (!calendar.user_id) {
    const { data: anySettings } = await supabase
      .from('user_settings')
      .select('*')
      .not('google_refresh_token', 'is', null)
      .limit(1)
      .single();

    if (anySettings) {
      await supabase.from('calendars').update({ user_id: anySettings.user_id }).eq('id', calendarId);
      calendar.user_id = anySettings.user_id;
      userSettings = anySettings;
    }
  } else {
    // 3. Fetch user settings (account-level integrations)
    const { data: settings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', calendar.user_id)
      .single();

    userSettings = settings;
  }

  // Google token is always at the account level
  const googleToken = userSettings?.google_refresh_token || null;

  // SMTP: prefer calendar-level override, fall back to account-level
  const smtpUser = calendar.smtp_user || userSettings?.smtp_user || null;
  const smtpPass = calendar.smtp_pass || userSettings?.smtp_pass || null;

  return {
    googleToken,
    smtpUser,
    smtpPass,
    calendar,
    userSettings
  };
}
