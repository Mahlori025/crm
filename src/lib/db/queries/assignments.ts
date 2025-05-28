// src/lib/db/queries/assignments.ts

// Get all agents with their current workload
export const getAgentsWithWorkload = `
  SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    u.active,
    COUNT(t.id) FILTER (WHERE t.status IN ('ASSIGNED', 'IN_PROGRESS')) as active_tickets,
    COUNT(t.id) FILTER (WHERE t.status = 'ASSIGNED') as assigned_tickets,
    COUNT(t.id) FILTER (WHERE t.status = 'IN_PROGRESS') as in_progress_tickets,
    COUNT(t.id) FILTER (WHERE t.resolved_at > CURRENT_DATE) as resolved_today,
    COALESCE(ap.max_tickets, 20) as max_tickets,
    COALESCE(ap.categories, ARRAY[]::text[]) as preferred_categories,
    COALESCE(ap.priorities, ARRAY[]::text[]) as preferred_priorities
  FROM users u
  LEFT JOIN tickets t ON u.id = t.assignee_id
  LEFT JOIN agent_preferences ap ON u.id = ap.user_id
  WHERE u.role IN ('AGENT', 'ADMIN', 'MANAGER')
    AND u.active = true
  GROUP BY u.id, u.name, u.email, u.role, u.active, ap.max_tickets, ap.categories, ap.priorities
  ORDER BY COUNT(t.id) FILTER (WHERE t.status IN ('ASSIGNED', 'IN_PROGRESS')) ASC
`;

// Get available agents for a specific ticket
export const getAvailableAgentsForTicket = `
  WITH ticket_info AS (
    SELECT category, priority FROM tickets WHERE id = $1
  ),
  agent_workload AS (
    SELECT 
      u.id,
      u.name,
      u.email,
      COUNT(t.id) FILTER (WHERE t.status IN ('ASSIGNED', 'IN_PROGRESS')) as active_tickets,
      COALESCE(ap.max_tickets, 20) as max_tickets,
      COALESCE(ap.categories, ARRAY[]::text[]) as preferred_categories,
      COALESCE(ap.priorities, ARRAY[]::text[]) as preferred_priorities,
      -- Calculate match score
      CASE 
        WHEN ti.category = ANY(COALESCE(ap.categories, ARRAY[]::text[])) THEN 10
        ELSE 0
      END +
      CASE 
        WHEN ti.priority = ANY(COALESCE(ap.priorities, ARRAY[]::text[])) THEN 5
        ELSE 0
      END as match_score
    FROM users u
    CROSS JOIN ticket_info ti
    LEFT JOIN tickets t ON u.id = t.assignee_id
    LEFT JOIN agent_preferences ap ON u.id = ap.user_id
    WHERE u.role IN ('AGENT', 'ADMIN', 'MANAGER')
      AND u.active = true
    GROUP BY u.id, u.name, u.email, ap.max_tickets, ap.categories, ap.priorities, ti.category, ti.priority
    HAVING COUNT(t.id) FILTER (WHERE t.status IN ('ASSIGNED', 'IN_PROGRESS')) < COALESCE(ap.max_tickets, 20)
  )
  SELECT * FROM agent_workload
  ORDER BY match_score DESC, active_tickets ASC
`;

// Assign ticket to agent
export const assignTicketToAgent = `
  UPDATE tickets 
  SET 
    assignee_id = $2,
    status = CASE 
      WHEN status = 'OPEN' THEN 'ASSIGNED'
      ELSE status 
    END,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = $1
  RETURNING *
`;

// Unassign ticket
export const unassignTicket = `
  UPDATE tickets 
  SET 
    assignee_id = NULL,
    status = CASE 
      WHEN status = 'ASSIGNED' THEN 'OPEN'
      ELSE status 
    END,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = $1
  RETURNING *
`;

// Get assignment history for a ticket
export const getTicketAssignmentHistory = `
  SELECT 
    al.id,
    al.created_at,
    al.details,
    u.name as assigned_by_name,
    COALESCE(
      (al.details->>'assignee_name')::text,
      (SELECT name FROM users WHERE id = (al.details->>'assignee_id')::uuid)
    ) as assigned_to_name
  FROM activity_logs al
  LEFT JOIN users u ON al.user_id = u.id
  WHERE al.ticket_id = $1
    AND al.action IN ('TICKET_ASSIGNED', 'TICKET_UNASSIGNED', 'TICKET_REASSIGNED')
  ORDER BY al.created_at DESC
`;

// Bulk assign tickets
export const bulkAssignTickets = `
  UPDATE tickets 
  SET 
    assignee_id = $2,
    status = CASE 
      WHEN status = 'OPEN' THEN 'ASSIGNED'
      ELSE status 
    END,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = ANY($1::uuid[])
    AND (assignee_id IS NULL OR assignee_id != $2)
  RETURNING *
`;

// Get agent statistics
export const getAgentStatistics = `
  SELECT 
    u.id,
    u.name,
    COUNT(t.id) FILTER (WHERE t.status IN ('ASSIGNED', 'IN_PROGRESS')) as active_tickets,
    COUNT(t.id) FILTER (WHERE t.resolved_at >= CURRENT_DATE - INTERVAL '7 days') as resolved_this_week,
    COUNT(t.id) FILTER (WHERE t.resolved_at >= CURRENT_DATE - INTERVAL '30 days') as resolved_this_month,
    AVG(EXTRACT(EPOCH FROM (t.resolved_at - t.created_at))/3600)::numeric(10,2) as avg_resolution_hours,
    AVG(EXTRACT(EPOCH FROM (t.first_response_at - t.created_at))/3600)::numeric(10,2) as avg_response_hours,
    COUNT(t.id) FILTER (WHERE t.sla_breached = true) as sla_breaches,
    COUNT(t.id) FILTER (WHERE t.customer_satisfaction >= 4) as satisfied_customers
  FROM users u
  LEFT JOIN tickets t ON u.id = t.assignee_id
  WHERE u.role IN ('AGENT', 'ADMIN', 'MANAGER')
  GROUP BY u.id, u.name
  ORDER BY u.name
`;