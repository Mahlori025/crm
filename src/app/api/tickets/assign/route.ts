import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import * as assignmentService from '@/lib/db/services/assignmentService';
import { checkPermission } from '@/lib/auth/permissions';

// POST /api/tickets/assign
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has permission to assign tickets
    const hasPermission = await checkPermission(session.user.id, 'assign_tickets');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const body = await request.json();
    const { ticketId, agentId, autoAssign } = body;
    
    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
    }
    
    let result;
    if (autoAssign) {
      // Auto-assign to agent with least workload
      result = await assignmentService.autoAssignTicket(ticketId);
    } else {
      // Manual assignment
      if (!agentId) {
        return NextResponse.json({ error: 'Agent ID is required for manual assignment' }, { status: 400 });
      }
      result = await assignmentService.assignTicket(ticketId, agentId);
    }
    
    if (!result) {
      return NextResponse.json({ error: 'Failed to assign ticket' }, { status: 404 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error assigning ticket:', error);
    return NextResponse.json({ error: 'Failed to assign ticket' }, { status: 500 });
  }
}

// GET /api/tickets/assign/agents
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const agents = await assignmentService.getAvailableAgents();
    return NextResponse.json(agents);
  } catch (error) {
    console.error('Error fetching available agents:', error);
    return NextResponse.json({ error: 'Failed to fetch available agents' }, { status: 500 });
  }
}