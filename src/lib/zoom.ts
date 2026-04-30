import { createAdminClient } from './supabase/admin';

async function getZoomAccessToken(userId: string) {
  const supabase = createAdminClient();
  const { data: settings } = await supabase
    .from('user_settings')
    .select('zoom_refresh_token')
    .eq('user_id', userId)
    .single();

  if (!settings?.zoom_refresh_token) {
    throw new Error('Zoom not connected');
  }

  // Request a new access token using the refresh token
  const response = await fetch('https://zoom.us/oauth/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: settings.zoom_refresh_token,
    }),
  });

  const data = await response.json();

  if (data.refresh_token) {
    // Zoom sometimes rotates the refresh token, so we save it back
    await supabase
      .from('user_settings')
      .update({ zoom_refresh_token: data.refresh_token })
      .eq('user_id', userId);
  }

  return data.access_token;
}

export async function createZoomMeeting(userId: string, meetingData: {
  topic: string;
  startTime: string; // ISO String
  duration: number; // minutes
  timezone: string;
}) {
  const accessToken = await getZoomAccessToken(userId);

  const response = await fetch('https://zoom.us/v2/users/me/meetings', {
    method: 'POST',
    headers: {
       'Authorization': `Bearer ${accessToken}`,
       'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: meetingData.topic,
      type: 2, // Scheduled meeting
      start_time: meetingData.startTime,
      duration: meetingData.duration,
      timezone: meetingData.timezone,
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: true,
        mute_upon_entry: true,
        waiting_room: false,
      }
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Zoom API Error:', data);
    throw new Error(data.message || 'Failed to create Zoom meeting');
  }

  return {
    join_url: data.join_url,
    meetingId: data.id,
    password: data.password
  };
}
