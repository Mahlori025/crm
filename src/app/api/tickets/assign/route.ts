// src/app/api/tickets/assign/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { assignmentService } from '@/lib/db/services/assignmentService';

// GET /api/tickets/assign/agents - Get available agents
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!session && !isDevelopment) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get('ticketId');
    
    let agents;
    if (ticketId) {
      // Get agents suitable for specific ticket
      agents = await assignmentService.getAvailableAgentsForTicket(ticketId);
    } else {
      // Get all agents with workload
      agents = await assignmentService.getAgentsWithWorkload();
    }
    
    return NextResponse.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

// POST /api/tickets/assign - Assign ticket(s)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const isDevelopment = process.env.NODE_ENV === 'development';
    const userId = session?.user.id || (isDevelopment ? 'dev-user-id' : null);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { ticketId, ticketIds, agentId, autoAssign } = body;
    
    // Validate input
    if (!ticketId && !ticketIds) {
      return NextResponse.json(
        { error: 'Either ticketId or ticketIds must be provided' },
        { status: 400 }
      );
    }
    
    if (!autoAssign && !agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required for manual assignment' },
        { status: 400 }
      );
    }
    
    let result;
    
    if (autoAssign) {
      // Auto-assign single ticket
      if (ticketId) {
        result = await assignmentService.autoAssignTicket(ticketId);
      } else {
        return NextResponse.json(
          { error: 'Auto-assign only supports single tickets' },
          { status: 400 }
        );
      }
    } else if (ticketIds && Array.isArray(ticketIds)) {
      // Bulk assign
      result = await assignmentService.bulkAssignTickets(ticketIds, agentId, userId);
    } else if (ticketId) {
      // Single manual assign
      result = await assignmentService.assignTicket(ticketId, agentId, userId);
    }
    
    if (!result) {
      return NextResponse.json(
        { error: 'No suitable agent found for auto-assignment' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error assigning ticket:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to assign ticket' },
      { status: 500 }
    );
  }
}

// DELETE /api/tickets/assign - Unassign ticket
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const isDevelopment = process.env.NODE_ENV === 'development';
    const userId = session?.user.id || (isDevelopment ? 'dev-user-id' : null);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get('ticketId');
    
    if (!ticketId) {
      return NextResponse.json(
        { error: 'Ticket ID is required' },
        { status: 400 }
      );
    }
    
    const result = await assignmentService.unassignTicket(ticketId, userId);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error unassigning ticket:', error);
    return NextResponse.json(
      { error: 'Failed to unassign ticket' },
      { status: 500 }
    );
  }
}