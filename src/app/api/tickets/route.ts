// src/app/api/tickets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { createTicket, getTickets } from '@/lib/db/queries/tickets';
import { newTicketSchema } from '@/types/ticket';
import { Permission, hasPermission } from '@/lib/auth/permissions';
import * as ticketService from '@/lib/db/services/ticketService';


// GET /api/tickets
export async function GET(request: NextRequest) {
    try {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status') || undefined;
      const priority = searchParams.get('priority') ? parseInt(searchParams.get('priority')!) : undefined;
      const categoryId = searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId')!) : undefined;
      const assignedTo = searchParams.get('assignedTo') ? parseInt(searchParams.get('assignedTo')!) : undefined;
      const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
      const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
      
      const result = await ticketService.getTickets({ 
        status, 
        priority, 
        categoryId, 
        assignedTo 
      }, page, limit);
      
      return NextResponse.json(result);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
    }
  }
  
  // POST /api/tickets
  export async function POST(request: NextRequest) {
    try {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      const body = await request.json();
      const ticket = await ticketService.createTicket({
        ...body,
        createdBy: session.user.id
      });
      
      return NextResponse.json(ticket, { status: 201 });
    } catch (error) {
      console.error('Error creating ticket:', error);
      return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
    }
  }


export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    
    // Parse query parameters
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const search = searchParams.get('search') || undefined;
    
    // Apply filters based on user role/permissions
    const filters: any = {};
    
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (search) filters.search = search;
    
    // Apply permission-based filters
    const userRole = session.user.role;
    
    if (!hasPermission(userRole, Permission.VIEW_ALL_TICKETS)) {
      if (hasPermission(userRole, Permission.VIEW_ASSIGNED_TICKETS)) {
        filters.assignee_id = session.user.id;
      } else {
        // Default to viewing only tickets created by the user
        filters.created_by = session.user.id;
      }
    }
    
    const result = await getTickets(limit, offset, filters);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user has permission to create tickets
    const userRole = session.user.role;
    if (!hasPermission(userRole, Permission.CREATE_TICKET)) {
      return NextResponse.json(
        { error: 'You do not have permission to create tickets' },
        { status: 403 }
      );
    }
    
    const body = await req.json();
    
    // Validate request body
    const validationResult = newTicketSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid ticket data', 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }
    
    const newTicket = validationResult.data;
    const ticket = await createTicket(newTicket, session.user.id);
    
    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}