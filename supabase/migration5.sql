-- Migration 5: Add Calendar Builder configs, Payments, Booking revenue stats, and Standalone Pages

-- Add calendar layout configuration for the new Calendar Builder
ALTER TABLE calendars
ADD COLUMN calendar_layout TEXT;

-- Add payment configuration to user_settings (for receiving payments)
ALTER TABLE user_settings
ADD COLUMN stripe_secret_key TEXT,
ADD COLUMN stripe_publishable_key TEXT,
ADD COLUMN paypal_client_id TEXT,
ADD COLUMN paypal_secret TEXT,
ADD COLUMN razorpay_key_id TEXT,
ADD COLUMN razorpay_key_secret TEXT;

-- Add pricing to calendars
ALTER TABLE calendars
ADD COLUMN require_payment BOOLEAN DEFAULT FALSE,
ADD COLUMN price DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN currency VARCHAR(3) DEFAULT 'USD';

-- Add payment tracking to bookings
ALTER TABLE bookings
ADD COLUMN amount_paid DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, refunded
ADD COLUMN payment_provider VARCHAR(20), -- stripe, paypal, razorpay
ADD COLUMN payment_intent_id TEXT;

-- Create standalone pages table for the Page Builder
CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    landing_layout TEXT, -- Re-use the drag-and-drop JSON
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for Pages
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published pages" ON pages FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Users manage their own pages" ON pages FOR ALL USING (auth.uid() = user_id);
