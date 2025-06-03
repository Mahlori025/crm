-- src/lib/db/migrations/002_sla_enhancements.sql
-- SLA Configuration table
CREATE TABLE IF NOT EXISTS sla_configs (
  id SERIAL PRIMARY KEY,
  priority VARCHAR(20) NOT NULL,
  response_time_hours INTEGER NOT NULL,
  resolution_time_hours INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(priority)
);

-- SLA tracking for tickets
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS sla_response_due TIMESTAMP WITH TIME ZONE;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS sla_resolution_due TIMESTAMP WITH TIME ZONE;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS first_response_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS sla_breached BOOLEAN DEFAULT FALSE;

-- SLA breach notifications log
CREATE TABLE IF NOT EXISTS sla_breach_notifications (
  id SERIAL PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES tickets(id),
  breach_type VARCHAR(20) NOT NULL, -- 'response' or 'resolution'
  notified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(ticket_id, breach_type)
);

-- Insert default SLA configurations
INSERT INTO sla_configs (priority, response_time_hours, resolution_time_hours) VALUES
('LOW', 24, 72),
('MEDIUM', 8, 24),
('HIGH', 2, 8),
('CRITICAL', 1, 4)
ON CONFLICT (priority) DO NOTHING;