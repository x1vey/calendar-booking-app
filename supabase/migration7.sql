-- Migration 7: Services and Team Members (Organization Mode)

-- ── Enums & Calendar Updates ─────────────────────────────────────────
ALTER TABLE calendars
ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'individual' CHECK (mode IN ('individual', 'organization')),
ADD COLUMN IF NOT EXISTS booking_type TEXT NOT NULL DEFAULT 'hourly' CHECK (booking_type IN ('hourly', 'daily'));

-- ── Services ────────────────────────────────────────────────────────
-- Represents a "purpose of booking", class, or service offered.
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calendar_id UUID NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    duration_mins INT NOT NULL DEFAULT 30,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Team Members ────────────────────────────────────────────────────
-- Represents providers, staff, or resources in an organization.
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calendar_id UUID NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    avatar_url TEXT,
    schedule JSONB, -- Custom working hours for this member
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Update Bookings ─────────────────────────────────────────────────
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES services(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS team_member_id UUID REFERENCES team_members(id) ON DELETE SET NULL;
