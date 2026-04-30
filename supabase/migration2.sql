-- Add landing page customization and branding fields
ALTER TABLE calendars
ADD COLUMN landing_page_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN hide_branding BOOLEAN DEFAULT FALSE,
ADD COLUMN subheading_text TEXT,
ADD COLUMN theme_bg_color VARCHAR(10) DEFAULT '#f8fafc',
ADD COLUMN theme_text_color VARCHAR(10) DEFAULT '#0f172a',
ADD COLUMN theme_heading_color VARCHAR(10) DEFAULT '#0f172a',
ADD COLUMN theme_subheading_color VARCHAR(10) DEFAULT '#64748b',
ADD COLUMN testimonial_headline TEXT,
ADD COLUMN cta_button_text TEXT DEFAULT 'Book Now',
ADD COLUMN expectations_headline TEXT,
ADD COLUMN expectations_body TEXT,
ADD COLUMN google_place_id VARCHAR(255);

-- (Optional: since we are replacing google_review_url with place_id, we could drop the old column, but it's safer to keep it for backwards compatibility if needed. The app will just use google_place_id now.)
