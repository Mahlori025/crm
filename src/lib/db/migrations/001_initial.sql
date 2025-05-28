-- src/lib/db/migrations/001_initial.sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'CUSTOMER',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categories table (for ticket categorization)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tickets table (enhanced)
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number SERIAL UNIQUE, -- Human-readable ticket number
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
  priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
  category VARCHAR(100) NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  assignee_id UUID REFERENCES users(id),
  customer_id UUID REFERENCES users(id),
  due_date TIMESTAMP WITH TIME ZONE,
  resolution TEXT,
  -- SLA fields
  sla_response_due TIMESTAMP WITH TIME ZONE,
  sla_resolution_due TIMESTAMP WITH TIME ZONE,
  first_response_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  sla_breached BOOLEAN DEFAULT false,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_assignee ON tickets(assignee_id);
CREATE INDEX idx_tickets_customer ON tickets(customer_id);
CREATE INDEX idx_tickets_created_by ON tickets(created_by);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_sla_breached ON tickets(sla_breached);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false, -- Internal notes vs customer-visible
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_ticket ON comments(ticket_id);

-- Activity logs
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_ticket ON activity_logs(ticket_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- SLA configurations
CREATE TABLE sla_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  priority VARCHAR(50) NOT NULL UNIQUE,
  response_time_hours INTEGER NOT NULL,
  resolution_time_hours INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- File attachments
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attachments_ticket ON attachments(ticket_id);
CREATE INDEX idx_attachments_comment ON attachments(comment_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default data
-- Default admin user with password 'admin123' (hashed)
INSERT INTO users (email, password, name, role)
VALUES ('admin@example.com', '$2a$10$yCb5oAjbH9RjRd9QvXrOT.UeM8eEa6Z.T9EyWOQpkJ4zP85YMXnH2', 'System Admin', 'ADMIN');

-- Default categories
INSERT INTO categories (name, description) VALUES
  ('Technical Support', 'Technical issues and bug reports'),
  ('Billing', 'Billing and payment related queries'),
  ('Account Management', 'Account settings and access issues'),
  ('Feature Request', 'New feature suggestions'),
  ('General Inquiry', 'General questions and information');

-- Default SLA configurations
INSERT INTO sla_configs (priority, response_time_hours, resolution_time_hours) VALUES
  ('LOW', 24, 72),
  ('MEDIUM', 8, 48),
  ('HIGH', 4, 24),
  ('CRITICAL', 1, 8);