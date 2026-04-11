export type CallType = 'one_on_one' | 'group';
export type BookingStatus = 'confirmed' | 'cancelled';
export type EmailTemplateType = 'confirmation' | 'reminder' | 'followup' | 'cancellation' | 'user_booking_alert' | 'client_reminder_1d' | 'client_reminder_5m' | 'user_reminder_5m';
export type EmailProvider = 'resend' | 'google_smtp';

export interface Calendar {
  id: string;
  user_id: string;
  use_global_settings: boolean;
  name: string;
  slug: string;
  description: string | null;
  call_type: CallType;
  max_attendees: number;
  slot_duration_minutes: number;
  google_refresh_token: string | null;
  is_active: boolean;
  timezone: string;
  email_provider: EmailProvider;
  smtp_user: string | null;
  smtp_pass: string | null;
  created_at: string;
}

export interface SlotRule {
  id: string;
  calendar_id: string;
  day_of_week: number; // 0=Sun, 6=Sat
  start_time: string; // HH:mm:ss
  end_time: string; // HH:mm:ss
}

export interface Booking {
  id: string;
  calendar_id: string;
  booker_name: string;
  booker_email: string;
  booker_timezone: string;
  start_time: string; // TIMESTAMPTZ (ISO string)
  end_time: string; // TIMESTAMPTZ (ISO string)
  google_event_id: string | null;
  meet_link: string | null;
  cancellation_token: string;
  status: BookingStatus;
  reminder_sent: boolean;
  followup_sent: boolean;
  rem_1d_client_sent: boolean;
  rem_5m_client_sent: boolean;
  rem_5m_user_sent: boolean;
  source: string | null;
  created_at: string;
}

export interface EmailTemplate {
  id: string;
  calendar_id: string;
  type: EmailTemplateType;
  subject: string;
  body_html: string;
  send_offset_minutes: number;
  is_active: boolean;
}

export interface AvailableSlot {
  startTime: string; // ISO string (UTC)
  endTime: string; // ISO string (UTC)
  localStartTime: string; // ISO string (Booker's timezone)
  localEndTime: string; // ISO string (Booker's timezone)
}

export interface BookingFormData {
  calendarSlug: string;
  bookerName: string;
  bookerEmail: string;
  bookerTimezone: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  note?: string;
}
