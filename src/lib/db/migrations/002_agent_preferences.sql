-- src/lib/db/migrations/002_agent_preferences.sql

-- Agent preferences table
CREATE TABLE IF NOT EXISTS agent_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  max_tickets INTEGER DEFAULT 20,
  categories TEXT[] DEFAULT ARRAY[]::TEXT[],
  priorities TEXT[] DEFAULT ARRAY[]::TEXT[],
  skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  availability_start TIME DEFAULT '09:00:00',
  availability_end TIME DEFAULT '17:00:00',
  auto_assign_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_preferences_user ON agent_preferences(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_agent_preferences_updated_at 
  BEFORE UPDATE ON agent_preferences 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Assignment rules table
CREATE TABLE IF NOT EXISTS assignment_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  rule_type VARCHAR(50) NOT NULL, -- 'round_robin', 'load_balanced', 'skill_based', 'priority_based'
  priority INTEGER DEFAULT 0,
  conditions JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Round-robin tracking
CREATE TABLE IF NOT EXISTS round_robin_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(100),
  last_assigned_user_id UUID REFERENCES users(id),
  last_assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add customer_satisfaction column to tickets if not exists
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS customer_satisfaction INTEGER CHECK (customer_satisfaction >= 1 AND customer_satisfaction <= 5);

-- Insert default assignment rules
INSERT INTO assignment_rules (name, description, rule_type, priority, conditions, active) VALUES
  ('High Priority Direct', 'Assign high/critical priority tickets to senior agents', 'priority_based', 100, '{"priorities": ["HIGH", "CRITICAL"], "require_senior": true}', true),
  ('Category Match', 'Assign tickets to agents with matching category preferences', 'skill_based', 50, '{}', true),
  ('Load Balance', 'Distribute tickets evenly among available agents', 'load_balanced', 10, '{}', true),
  ('Round Robin', 'Assign tickets in rotation', 'round_robin', 1, '{}', true);

-- Create some test agents with preferences
INSERT INTO users (email, password, name, role) VALUES
  ('agent1@example.com', '$2a$10$yCb5oAjbH9RjRd9QvXrOT.UeM8eEa6Z.T9EyWOQpkJ4zP85YMXnH2', 'Agent One', 'AGENT'),
  ('agent2@example.com', '$2a$10$yCb5oAjbH9RjRd9QvXrOT.UeM8eEa6Z.T9EyWOQpkJ4zP85YMXnH2', 'Agent Two', 'AGENT'),
  ('manager1@example.com', '$2a$10$yCb5oAjbH9RjRd9QvXrOT.UeM8eEa6Z.T9EyWOQpkJ4zP85YMXnH2', 'Manager One', 'MANAGER')
ON CONFLICT (email) DO NOTHING;

-- Add agent preferences for test agents
INSERT INTO agent_preferences (user_id, max_tickets, categories, priorities)
SELECT id, 15, ARRAY['Technical Support', 'Billing'], ARRAY['HIGH', 'CRITICAL']
FROM users WHERE email = 'agent1@example.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO agent_preferences (user_id, max_tickets, categories, priorities)
SELECT id, 20, ARRAY['Account Management', 'General Inquiry'], ARRAY['LOW', 'MEDIUM']
FROM users WHERE email = 'agent2@example.com'
ON CONFLICT (user_id) DO NOTHING;