-- Email Pipeline System
-- Adds visual flowchart-based email pipelines per calendar

-- Table 1: email_pipelines
CREATE TABLE email_pipelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calendar_id UUID NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
    trigger_event TEXT NOT NULL CHECK (trigger_event IN ('booking_confirmed', 'booking_cancelled')),
    name TEXT NOT NULL DEFAULT 'Default Pipeline',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(calendar_id, trigger_event)
);

-- Table 2: email_pipeline_steps
CREATE TABLE email_pipeline_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_id UUID NOT NULL REFERENCES email_pipelines(id) ON DELETE CASCADE,
    step_order INT NOT NULL,
    step_type TEXT NOT NULL CHECK (step_type IN ('send_email', 'wait')),
    email_template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
    wait_duration_minutes INT,
    wait_anchor TEXT CHECK (wait_anchor IN ('after_previous', 'before_event')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(pipeline_id, step_order)
);

-- Table 3: email_pipeline_executions
CREATE TABLE email_pipeline_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    pipeline_id UUID NOT NULL REFERENCES email_pipelines(id) ON DELETE CASCADE,
    step_id UUID NOT NULL REFERENCES email_pipeline_steps(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'waiting', 'sent', 'skipped', 'failed')),
    scheduled_at TIMESTAMPTZ,
    executed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(booking_id, step_id)
);

-- Add pipeline flag to bookings
ALTER TABLE bookings ADD COLUMN uses_pipeline BOOLEAN NOT NULL DEFAULT FALSE;

-- Indexes
CREATE INDEX idx_pipeline_executions_status ON email_pipeline_executions(status);
CREATE INDEX idx_pipeline_executions_scheduled ON email_pipeline_executions(scheduled_at) WHERE status IN ('pending', 'waiting');
CREATE INDEX idx_pipeline_steps_pipeline ON email_pipeline_steps(pipeline_id, step_order);

-- RLS
ALTER TABLE email_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_pipeline_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_pipeline_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage pipelines for their own calendars" ON email_pipelines
FOR ALL USING (EXISTS (SELECT 1 FROM calendars WHERE id = email_pipelines.calendar_id AND user_id = auth.uid()));

CREATE POLICY "Users can manage pipeline steps" ON email_pipeline_steps
FOR ALL USING (EXISTS (
    SELECT 1 FROM email_pipelines p
    JOIN calendars c ON c.id = p.calendar_id
    WHERE p.id = email_pipeline_steps.pipeline_id AND c.user_id = auth.uid()
));

CREATE POLICY "Users can view executions for their bookings" ON email_pipeline_executions
FOR ALL USING (EXISTS (
    SELECT 1 FROM bookings b
    JOIN calendars c ON c.id = b.calendar_id
    WHERE b.id = email_pipeline_executions.booking_id AND c.user_id = auth.uid()
));
