// src/app/api/agents/stats/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!session && !isDevelopment) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agentId = params.id;

    // Get today's stats
    const todayStatsResult = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE DATE(t.created_at) = CURRENT_DATE AND t.assignee_id = $1) as new_assigned,
        COUNT(*) FILTER (WHERE DATE(t.resolved_at) = CURRENT_DATE AND t.assignee_id = $1) as resolved,
        COUNT(*) FILTER (WHERE t.sla_breached = true AND t.assignee_id = $1) as sla_breaches,
        AVG(EXTRACT(EPOCH FROM (t.first_response_at - t.created_at))/3600)::numeric(10,2) as avg_response_hours
      FROM tickets t
      WHERE t.assignee_id = $1
    `, [agentId]);

    // Get workload stats
    const workloadResult = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE t.status IN ('ASSIGNED', 'IN_PROGRESS')) as active_tickets,
        COALESCE(ap.max_tickets, 20) as max_tickets
      FROM tickets t
      RIGHT JOIN users u ON u.id = $1
      LEFT JOIN agent_preferences ap ON u.id = ap.user_id
      WHERE t.assignee_id = $1 OR t.assignee_id IS NULL
      GROUP BY ap.max_tickets
    `, [agentId]);

    const todayStats = todayStatsResult.rows[0] || {
      new_assigned: 0,
      resolved: 0,
      sla_breaches: 0,
      avg_response_hours: 0
    };

    const workload = workloadResult.rows[0] || {
      active_tickets: 0,
      max_tickets: 20
    };

    const utilizationPercent = Math.round((workload.active_tickets / workload.max_tickets) * 100);

    return NextResponse.json({
      todayStats: {
        newAssigned: parseInt(todayStats.new_assigned),
        resolved: parseInt(todayStats.resolved),
        responseTime: parseFloat(todayStats.avg_response_hours) || 0,
        slaBreaches: parseInt(todayStats.sla_breaches)
      },
      workload: {
        activeTickets: parseInt(workload.active_tickets),
        maxTickets: parseInt(workload.max_tickets),
        utilizationPercent
      }
    });
  } catch (error) {
    console.error('Error fetching agent statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent statistics' },
      { status: 500 }
    );
  }
}