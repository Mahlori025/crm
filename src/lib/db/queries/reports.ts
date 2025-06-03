// src/lib/db/queries/reports.ts
export const reportQueries = {
  // Ticket Volume Over Time
  ticketVolumeOverTime: `
    SELECT 
      DATE_TRUNC('day', created_at) as date,
      COUNT(*) as total_tickets,
      COUNT(*) FILTER (WHERE priority = 'CRITICAL') as critical_tickets,
      COUNT(*) FILTER (WHERE priority = 'HIGH') as high_tickets,
      COUNT(*) FILTER (WHERE priority = 'MEDIUM') as medium_tickets,
      COUNT(*) FILTER (WHERE priority = 'LOW') as low_tickets
    FROM tickets
    WHERE created_at >= $1 AND created_at <= $2
    GROUP BY DATE_TRUNC('day', created_at)
    ORDER BY date
  `,

  // Agent Performance Metrics
  agentPerformanceMetrics: `
    SELECT 
      u.id,
      u.name,
      COUNT(t.id) as total_assigned,
      COUNT(t.id) FILTER (WHERE t.status = 'RESOLVED') as resolved_tickets,
      COUNT(t.id) FILTER (WHERE t.sla_breached = true) as sla_breaches,
      AVG(EXTRACT(EPOCH FROM (t.first_response_at - t.created_at))/3600)::numeric(10,2) as avg_response_hours,
      AVG(EXTRACT(EPOCH FROM (t.resolved_at - t.created_at))/3600)::numeric(10,2) as avg_resolution_hours,
      AVG(t.customer_satisfaction)::numeric(10,2) as avg_satisfaction
    FROM users u
    LEFT JOIN tickets t ON u.id = t.assignee_id
    WHERE u.role IN ('AGENT', 'ADMIN', 'MANAGER')
      AND (t.created_at IS NULL OR (t.created_at >= $1 AND t.created_at <= $2))
    GROUP BY u.id, u.name
    ORDER BY resolved_tickets DESC
  `,

  // SLA Performance Report
  slaPerformanceReport: `
    SELECT 
      priority,
      COUNT(*) as total_tickets,
      COUNT(*) FILTER (WHERE sla_breached = false) as sla_met,
      COUNT(*) FILTER (WHERE sla_breached = true) as sla_breached,
      ROUND(
        (COUNT(*) FILTER (WHERE sla_breached = false)::numeric / COUNT(*)::numeric) * 100, 
        2
      ) as sla_compliance_rate,
      AVG(EXTRACT(EPOCH FROM (first_response_at - created_at))/3600)::numeric(10,2) as avg_response_time,
      AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600)::numeric(10,2) as avg_resolution_time
    FROM tickets
    WHERE created_at >= $1 AND created_at <= $2
      AND resolved_at IS NOT NULL
    GROUP BY priority
    ORDER BY 
      CASE priority
        WHEN 'CRITICAL' THEN 1
        WHEN 'HIGH' THEN 2
        WHEN 'MEDIUM' THEN 3
        WHEN 'LOW' THEN 4
      END
  `,

  // Category Distribution
  categoryDistribution: `
    SELECT 
      category,
      COUNT(*) as ticket_count,
      AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600)::numeric(10,2) as avg_resolution_hours,
      COUNT(*) FILTER (WHERE sla_breached = true) as sla_breaches,
      ROUND(AVG(customer_satisfaction)::numeric, 2) as avg_satisfaction
    FROM tickets
    WHERE created_at >= $1 AND created_at <= $2
    GROUP BY category
    ORDER BY ticket_count DESC
  `,

  // Customer Satisfaction Trends
  satisfactionTrends: `
    SELECT 
      DATE_TRUNC('week', resolved_at) as week,
      AVG(customer_satisfaction)::numeric(10,2) as avg_satisfaction,
      COUNT(*) as total_resolved,
      COUNT(*) FILTER (WHERE customer_satisfaction >= 4) as satisfied_count
    FROM tickets
    WHERE resolved_at >= $1 AND resolved_at <= $2
      AND customer_satisfaction IS NOT NULL
    GROUP BY DATE_TRUNC('week', resolved_at)
    ORDER BY week
  `,

  // Ticket Status Distribution
  statusDistribution: `
    SELECT 
      status,
      COUNT(*) as count,
      ROUND((COUNT(*)::numeric / total.total_count::numeric) * 100, 2) as percentage
    FROM tickets t
    CROSS JOIN (
      SELECT COUNT(*) as total_count 
      FROM tickets 
      WHERE created_at >= $1 AND created_at <= $2
    ) total
    WHERE t.created_at >= $1 AND t.created_at <= $2
    GROUP BY status, total.total_count
    ORDER BY count DESC
  `,

  // Response Time Distribution
  responseTimeDistribution: `
    SELECT 
      CASE 
        WHEN EXTRACT(EPOCH FROM (first_response_at - created_at))/3600 <= 1 THEN '≤ 1 hour'
        WHEN EXTRACT(EPOCH FROM (first_response_at - created_at))/3600 <= 4 THEN '1-4 hours'
        WHEN EXTRACT(EPOCH FROM (first_response_at - created_at))/3600 <= 24 THEN '4-24 hours'
        ELSE '> 24 hours'
      END as response_time_bucket,
      COUNT(*) as ticket_count
    FROM tickets
    WHERE first_response_at IS NOT NULL
      AND created_at >= $1 AND created_at <= $2
    GROUP BY response_time_bucket
    ORDER BY 
      CASE response_time_bucket
        WHEN '≤ 1 hour' THEN 1
        WHEN '1-4 hours' THEN 2
        WHEN '4-24 hours' THEN 3
        WHEN '> 24 hours' THEN 4
      END
  `,

  // Executive Dashboard Summary
  executiveSummary: `
    WITH ticket_stats AS (
      SELECT 
        COUNT(*) as total_tickets,
        COUNT(*) FILTER (WHERE status = 'RESOLVED') as resolved_tickets,
        COUNT(*) FILTER (WHERE sla_breached = true) as sla_breached_tickets,
        AVG(customer_satisfaction)::numeric(10,2) as avg_satisfaction,
        AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600)::numeric(10,2) as avg_resolution_hours
      FROM tickets
      WHERE created_at >= $1 AND created_at <= $2
    ),
    previous_period_stats AS (
      SELECT 
        COUNT(*) as prev_total_tickets,
        COUNT(*) FILTER (WHERE status = 'RESOLVED') as prev_resolved_tickets,
        AVG(customer_satisfaction)::numeric(10,2) as prev_avg_satisfaction
      FROM tickets
      WHERE created_at >= $3 AND created_at <= $4
    )
    SELECT 
      ts.*,
      ps.prev_total_tickets,
      ps.prev_resolved_tickets,
      ps.prev_avg_satisfaction,
      ROUND(
        ((ts.total_tickets - ps.prev_total_tickets)::numeric / NULLIF(ps.prev_total_tickets, 0)::numeric) * 100, 
        2
      ) as ticket_volume_change,
      ROUND(
        ((ts.avg_satisfaction - ps.prev_avg_satisfaction)::numeric / NULLIF(ps.prev_avg_satisfaction, 0)::numeric) * 100, 
        2
      ) as satisfaction_change
    FROM ticket_stats ts
    CROSS JOIN previous_period_stats ps
  `
};