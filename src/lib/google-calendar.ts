import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export function getOAuth2Client() {
  return oauth2Client;
}

export function getAuthUrl(state: string) {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/calendar.readonly',
    ],
    state,
  });
}

export async function exchangeCodeForTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export function getAuthenticatedCalendar(refreshToken: string) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  auth.setCredentials({ refresh_token: refreshToken });
  return google.calendar({ version: 'v3', auth });
}

export async function createCalendarEvent(refreshToken: string, eventData: {
  summary: string;
  start: string;
  end: string;
  attendees: { email: string }[];
  timezone: string;
}) {
  const calendar = getAuthenticatedCalendar(refreshToken);
  
  const response = await calendar.events.insert({
    calendarId: 'primary',
    conferenceDataVersion: 1,
    requestBody: {
      summary: eventData.summary,
      start: {
        dateTime: eventData.start,
        timeZone: eventData.timezone,
      },
      end: {
        dateTime: eventData.end,
        timeZone: eventData.timezone,
      },
      attendees: eventData.attendees,
      conferenceData: {
        createRequest: {
          requestId: uuidv4(),
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    },
  });

  return {
    eventId: response.data.id,
    meetLink: response.data.hangoutLink,
  };
}

export async function deleteCalendarEvent(refreshToken: string, eventId: string) {
  const calendar = getAuthenticatedCalendar(refreshToken);
  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });
  } catch (error: any) {
    // Gracefully handle if event was already deleted
    if (error.code !== 404 && error.code !== 410) {
      throw error;
    }
  }
}

export async function getFreeBusy(refreshToken: string, timeMin: string, timeMax: string) {
  const calendar = getAuthenticatedCalendar(refreshToken);
  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      items: [{ id: 'primary' }],
    },
  });

  return response.data.calendars?.primary.busy || [];
}
