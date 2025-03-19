// src/app/api/tickets/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getTicketById, updateTicket, deleteTicket } from '@/lib/db/queries/tickets';
import { ticketUpdateSchema } from '@/types/ticket';
import { Permission, hasPermission } from '@/lib/auth/permissions';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const ticket = await getTicketById(params.id);
    
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }
    
    // Check if user has permission to view this ticket
    const userRole = session.user.role;
    const userId = session.user.id;
    
    const canViewAllTickets = hasPermission(userRole, Permission.VIEW_ALL_TICKETS);
    const canViewAssignedTickets = hasPermission(userRole, Permission.VIEW_ASSIGNED_TICKETS);
    const isAssignee = ticket.assignee_id === userId;
    const isCreator = ticket.created_by === userId;
    
    if (!canViewAllTickets && !(canViewAssignedTickets && isAssignee) && !isCreator) {
      return NextResponse.json(
        { error: 'You do not have permission to view this ticket' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const userRole = session.user.role;
    const userId = session.user.id;
    
    // Check if ticket exists
    const existingTicket = await getTicketById(params.id);
    
    if (!existingTicket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }
    
    // Check permissions
    const canUpdateAnyTicket = hasPermission(userRole, Permission.UPDATE_ANY_TICKET);
    const canUpdateAssignedTicket = hasPermission(userRole, Permission.UPDATE_ASSIGNED_TICKET);
    const isAssignee = existingTicket.assignee_id === userId;
    
    if (!canUpdateAnyTicket && !(canUpdateAssignedTicket && isAssignee)) {
      return NextResponse.json(
        { error: 'You do not have permission to update this ticket' },
        { status: 403 }
      );
    }
    
    const body = await req.json();
    
    // Validate request body
    const validationResult = ticketUpdateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid ticket data', 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }
    
    const updates = validationResult.data;
    const updatedTicket = await updateTicket(params.id, updates, userId);
    
    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const userRole = session.user.role;
    
    // Check if user has permission to delete tickets
    if (!hasPermission(userRole, Permission.DELETE_TICKET)) {
      return NextResponse.json(
        { error: 'You do not have permission to delete tickets' },
        { status: 403 }
      );
    }
    
    await deleteTicket(params.id, session.user.id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    );
  }
}