export type CallType = 'one_on_one' | 'group';
export type BookingStatus = 'confirmed' | 'cancelled';
export type EmailTemplateType = 'confirmation' | 'reminder' | 'followup' | 'cancellation' | 'user_booking_alert' | 'client_reminder_1d' | 'client_reminder_5m' | 'user_reminder_5m' | 'reschedule_confirmation' | 'user_reschedule_alert' | 'review_request';
export type EmailProvider = 'resend' | 'google_smtp';

export interface UserSettings {
  user_id: string;
  google_refresh_token: string | null;
  smtp_user: string | null;
  smtp_pass: string | null;
  avatar_url: string | null;
  about_me: string | null;
  display_name: string | null;
  notification_email: string | null;
  zoom_refresh_token: string | null;
  microsoft_refresh_token: string | null;
  slack_webhook_url: string | null;
  whatsapp_enabled: boolean;
  twilio_account_sid: string | null;
  twilio_auth_token: string | null;
  twilio_whatsapp_number: string | null;
  
  // Payment Integration
  stripe_secret_key: string | null;
  stripe_publishable_key: string | null;
  paypal_client_id: string | null;
  paypal_secret: string | null;
  razorpay_key_id: string | null;
  razorpay_key_secret: string | null;

  updated_at: string;
}

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
  
  // Landing Page Customization
  landing_page_enabled: boolean;
  hide_branding: boolean;
  heading_text: string | null;
  subheading_text: string | null;
  hero_image_url: string | null;
  theme_bg_color: string | null;
  theme_text_color: string | null;
  theme_heading_color: string | null;
  theme_subheading_color: string | null;
  cta_button_text: string | null;
  expectations_headline: string | null;
  expectations_body: string | null;
  youtube_video_url: string | null;
  testimonial_videos: string[]; // (Kept for backwards compat, UI will limit to 1)
  testimonial_headline: string | null;
  google_review_url: string | null; // Old field
  google_place_id: string | null; // New native integration
  privacy_url: string | null;
  terms_url: string | null;
  review_request_sent: boolean;
  
  // Page Builder Layout (JSON string)
  landing_layout: string | null;
  
  // Calendar Widget Layout Builder (JSON string)
  calendar_layout: string | null;

  // Payments
  require_payment: boolean;
  price: number;
  currency: string;
  
  meeting_provider: 'google_meet' | 'zoom' | 'ms_teams' | null;
  calendar_sync_provider: 'google' | 'outlook' | null;
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
  review_request_sent: boolean;
  source: string | null;
  booker_phone: string | null;
  
  // Payments
  amount_paid: number;
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_provider: 'stripe' | 'paypal' | 'razorpay' | null;
  payment_intent_id: string | null;

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
