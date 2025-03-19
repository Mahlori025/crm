// Assign ticket to an agent
export const assignTicketQuery = `
  UPDATE tickets 
  SET assigned_to = $2, 
      assigned_at = NOW(),
      status = CASE WHEN status = 'new' THEN 'assigned' ELSE status END
  WHERE id = $1
  RETURNING *;
`;

// Get available agents with workload
export const getAvailableAgentsQuery = `
  SELECT u.id, u.full_name, u.email, u.role,
    COUNT(t.id) FILTER (WHERE t.status IN ('assigned', 'in_progress')) as active_tickets
  FROM users u
  LEFT JOIN tickets t ON u.id = t.assigned_to
  WHERE u.role = 'agent' AND u.status = 'active'
  GROUP BY u.id
  ORDER BY active_tickets ASC;
`;

// Auto-assign ticket based on workload
export const autoAssignTicketQuery = `
  WITH available_agents AS (
    SELECT u.id, COUNT(t.id) FILTER (WHERE t.status IN ('assigned', 'in_progress')) as active_tickets
    FROM users u
    LEFT JOIN tickets t ON u.id = t.assigned_to
    WHERE u.role = 'agent' AND u.status = 'active'
    GROUP BY u.id
    ORDER BY active_tickets ASC
    LIMIT 1
  )
  UPDATE tickets
  SET assigned_to = (SELECT id FROM available_agents),
      assigned_at = NOW(),
      status = 'assigned'
  WHERE id = $1
  RETURNING *;
`;