-- Phase 2: Microsoft Teams + Outlook
ALTER TABLE user_settings
ADD COLUMN microsoft_refresh_token TEXT;

ALTER TABLE calendars 
ADD COLUMN calendar_sync_provider TEXT DEFAULT 'google';

-- Phase 3: Slack Notifications
ALTER TABLE user_settings
ADD COLUMN slack_webhook_url TEXT;

-- Phase 4: WhatsApp Notifications
ALTER TABLE bookings 
ADD COLUMN booker_phone TEXT;

ALTER TABLE user_settings 
ADD COLUMN whatsapp_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN twilio_account_sid TEXT,
ADD COLUMN twilio_auth_token TEXT,
ADD COLUMN twilio_whatsapp_number TEXT;
