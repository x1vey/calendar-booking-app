import { createAdminClient } from './supabase/admin';

export async function getMicrosoftAccessToken(userId: string) {
  const supabase = createAdminClient();
  const { data: settings } = await supabase
    .from('user_settings')
    .select('microsoft_refresh_token')
    .eq('user_id', userId)
    .single();

  if (!settings?.microsoft_refresh_token) {
    throw new Error('Microsoft account not connected');
  }

  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;

  const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      grant_type: 'refresh_token',
      refresh_token: settings.microsoft_refresh_token,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Microsoft Token Refresh Error:', data);
    throw new Error('Failed to refresh Microsoft access token');
  }

  if (data.refresh_token) {
    await supabase
      .from('user_settings')
      .update({ microsoft_refresh_token: data.refresh_token })
      .eq('user_id', userId);
  }

  return data.access_token;
}

export async function createTeamsMeeting(userId: string, meetingData: {
  subject: string;
  startTime: string; // ISO
  endTime: string; // ISO
}) {
  const accessToken = await getMicrosoftAccessToken(userId);

  const response = await fetch('https://graph.microsoft.com/v1.0/me/onlineMeetings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startDateTime: meetingData.startTime,
      endDateTime: meetingData.endTime,
      subject: meetingData.subject,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Teams Meeting Error:', data);
    throw new Error('Failed to create Teams meeting');
  }

  return {
    joinUrl: data.joinWebUrl,
    meetingId: data.id,
  };
}

export async function getOutlookFreeBusy(userId: string, timeMin: string, timeMax: string, timeZone: string) {
  const accessToken = await getMicrosoftAccessToken(userId);
  const response = await fetch('https://graph.microsoft.com/v1.0/me/calendar/getSchedule', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Prefer: `outlook.timezone="${timeZone}"`
    },
    body: JSON.stringify({
      schedules: ['me'],
      startTime: { dateTime: timeMin, timeZone: 'UTC' },
      endTime: { dateTime: timeMax, timeZone: 'UTC' },
      availabilityViewInterval: 15,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Outlook Free/Busy Error:', data);
    return []; // Return empty so it doesn't break slot generation
  }

  const busySlots: { start: string; end: string }[] = [];
  const schedule = data.value?.[0]?.scheduleItems || [];
  
  for (const item of schedule) {
    if (item.status === 'busy' || item.status === 'oof' || item.status === 'tentative') {
      busySlots.push({
        start: new Date(item.start.dateTime + 'Z').toISOString(),
        end: new Date(item.end.dateTime + 'Z').toISOString()
      });
    }
  }

  return busySlots;
}

export async function createOutlookEvent(userId: string, eventData: {
  subject: string;
  startTime: string; // ISO
  endTime: string; // ISO
  description?: string;
  location?: string;
}) {
  const accessToken = await getMicrosoftAccessToken(userId);
  const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject: eventData.subject,
      body: {
        contentType: 'HTML',
        content: eventData.description || '',
      },
      start: {
        dateTime: eventData.startTime,
        timeZone: 'UTC',
      },
      end: {
        dateTime: eventData.endTime,
        timeZone: 'UTC',
      },
      location: {
        displayName: eventData.location || '',
      },
    }),
  });

  if (!response.ok) {
    console.error('Outlook Create Event Error:', await response.text());
  }
}
