-- Enums
CREATE TYPE call_type_enum AS ENUM ('one_on_one', 'group');
CREATE TYPE booking_status_enum AS ENUM ('confirmed', 'cancelled');
CREATE TYPE email_template_type_enum AS ENUM ('confirmation', 'reminder', 'followup', 'cancellation', 'user_booking_alert', 'client_reminder_1d', 'client_reminder_5m', 'user_reminder_5m');
CREATE TYPE email_provider_enum AS ENUM ('resend', 'google_smtp');

-- Tables
CREATE TABLE user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    google_refresh_token TEXT,
    smtp_user TEXT,
    smtp_pass TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE calendars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    call_type call_type_enum NOT NULL DEFAULT 'one_on_one',
    max_attendees INT NOT NULL DEFAULT 1,
    slot_duration_minutes INT NOT NULL DEFAULT 30,
    google_refresh_token TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    email_provider email_provider_enum NOT NULL DEFAULT 'resend',
    smtp_user TEXT,
    smtp_pass TEXT, -- Should be encrypted if possible, or stored as sensitive
    user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    use_global_settings BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE slot_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calendar_id UUID NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    CHECK (start_time < end_time)
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calendar_id UUID NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
    booker_name TEXT NOT NULL,
    booker_email TEXT NOT NULL,
    booker_timezone TEXT NOT NULL DEFAULT 'UTC',
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    google_event_id TEXT,
    meet_link TEXT,
    cancellation_token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    status booking_status_enum NOT NULL DEFAULT 'confirmed',
    reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
    followup_sent BOOLEAN NOT NULL DEFAULT FALSE,
    rem_1d_client_sent BOOLEAN NOT NULL DEFAULT FALSE,
    rem_5m_client_sent BOOLEAN NOT NULL DEFAULT FALSE,
    rem_5m_user_sent BOOLEAN NOT NULL DEFAULT FALSE,
    alert_user_sent BOOLEAN NOT NULL DEFAULT FALSE,
    source TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (start_time < end_time)
);

CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calendar_id UUID NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
    type email_template_type_enum NOT NULL,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    send_offset_minutes INT NOT NULL DEFAULT 0, -- e.g. -1440 for 24h before
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE(calendar_id, type)
);

-- Indexes
CREATE INDEX idx_bookings_calendar_id ON bookings(calendar_id);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_bookings_cancellation_token ON bookings(cancellation_token);
CREATE INDEX idx_calendars_slug ON calendars(slug);

-- RLS (Basic setup, assuming admin auth via Supabase)
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE slot_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Policies

-- User Settings: Owners only
CREATE POLICY "Users can only manage their own settings" ON user_settings 
FOR ALL USING (auth.uid() = user_id);

-- Calendars: Public read (active only), Owners manage
CREATE POLICY "Anyone can view active calendars" ON calendars 
FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Users can manage their own calendars" ON calendars 
FOR ALL USING (auth.uid() = user_id);

-- Slot Rules: Public read, Owners manage
CREATE POLICY "Anyone can view slot rules for active calendars" ON slot_rules 
FOR SELECT USING (EXISTS (SELECT 1 FROM calendars WHERE id = slot_rules.calendar_id AND is_active = TRUE));

CREATE POLICY "Users can manage slot rules for their own calendars" ON slot_rules 
FOR ALL USING (EXISTS (SELECT 1 FROM calendars WHERE id = slot_rules.calendar_id AND user_id = auth.uid()));

-- Bookings: Public insert, Owners manage, Token-based read for cancellations
CREATE POLICY "Anyone can book a slot" ON bookings 
FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can manage bookings for their own calendars" ON bookings 
FOR ALL USING (EXISTS (SELECT 1 FROM calendars WHERE id = bookings.calendar_id AND user_id = auth.uid()));

CREATE POLICY "Access booking via cancellation token" ON bookings 
FOR SELECT USING (cancellation_token IS NOT NULL);

-- Email Templates: Owners only
CREATE POLICY "Users can manage templates for their own calendars" ON email_templates 
FOR ALL USING (EXISTS (SELECT 1 FROM calendars WHERE id = email_templates.calendar_id AND user_id = auth.uid()));

