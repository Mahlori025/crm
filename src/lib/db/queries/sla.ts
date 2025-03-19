// src/lib/db/queries/sla.ts
export const createSlaConfigQuery = `
  INSERT INTO sla_configs (
    priority, response_time_hours, resolution_time_hours
  ) VALUES ($1, $2, $3) RETURNING *;
`;

export const getSlaConfigsQuery = `
  SELECT * FROM sla_configs ORDER BY priority;
`;

export const updateTicketSlaQuery = `
  UPDATE tickets 
  SET 
    sla_response_due = $2,
    sla_resolution_due = $3,
    sla_updated_at = NOW()
  WHERE id = $1
  RETURNING *;
`;

export const getBreachedSlaTicketsQuery = `
  SELECT t.*, 
    u.full_name as assigned_to_name,
    c.name as category_name
  FROM tickets t
  LEFT JOIN users u ON t.assigned_to = u.id
  LEFT JOIN categories c ON t.category_id = c.id
  WHERE
    (t.status != 'closed' AND t.status != 'resolved')
    AND (
      (t.first_response_at IS NULL AND t.sla_response_due < NOW())
      OR
      (t.sla_resolution_due < NOW())
    )
  ORDER BY 
    CASE WHEN t.first_response_at IS NULL AND t.sla_response_due < NOW() THEN t.sla_response_due
         ELSE t.sla_resolution_due END ASC;
`;