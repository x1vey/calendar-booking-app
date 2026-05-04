-- Migration 6: Aesthetic Calendar Themes
-- Adds calendar_theme and accent_color columns to the calendars table.
-- Also adds updated_at to calendars (if not already present).

-- ── Theme column ──────────────────────────────────────────────────────────────
-- Stores the selected aesthetic theme key: 'fitness' | 'tattoo' | 'garment' | 'default'
ALTER TABLE calendars
ADD COLUMN IF NOT EXISTS calendar_theme TEXT NOT NULL DEFAULT 'default';

-- ── Accent colour override ────────────────────────────────────────────────────
-- Optional per-business hex override (e.g. '#ff4d00').
-- When NULL, the theme's default accent is used.
ALTER TABLE calendars
ADD COLUMN IF NOT EXISTS accent_color TEXT;

-- ── Updated_at (idempotent) ───────────────────────────────────────────────────
ALTER TABLE calendars
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Auto-update trigger for calendars.updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_calendars_updated_at ON calendars;
CREATE TRIGGER set_calendars_updated_at
BEFORE UPDATE ON calendars
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Validate theme values ─────────────────────────────────────────────────────
ALTER TABLE calendars
ADD CONSTRAINT calendars_calendar_theme_check
CHECK (calendar_theme IN ('fitness', 'tattoo', 'garment', 'default'));
