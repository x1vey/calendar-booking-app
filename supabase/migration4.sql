-- Add landing_layout column for the drag-and-drop page builder
-- Stores the full page layout as a JSON string (section order, props, global styles)
ALTER TABLE calendars
ADD COLUMN landing_layout TEXT;
