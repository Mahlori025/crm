import { db } from '../index';
import * as queries from '../queries/tickets';
import { Ticket, TicketCreate, TicketUpdate } from '@/types/ticket';

export async function createTicket(ticket: TicketCreate): Promise<Ticket> {
  const { title, description, status, priority, categoryId, createdBy, assignedTo } = ticket;
  
  const result = await db.query(queries.createTicketQuery, [
    title, description, status, priority, 
    categoryId, createdBy, assignedTo || null
  ]);
  
  return result.rows[0];
}

export async function getTickets(
  filters: { status?: string; priority?: number; categoryId?: number; assignedTo?: number },
  page = 1,
  limit = 10
): Promise<{ tickets: Ticket[]; total: number }> {
  const offset = (page - 1) * limit;
  const { status, priority, categoryId, assignedTo } = filters;
  
  const result = await db.query(queries.getTicketsQuery, [
    status || null,
    priority || null,
    categoryId || null,
    assignedTo || null,
    limit,
    offset
  ]);
  
  const countResult = await db.query('SELECT COUNT(*) FROM tickets');
  const total = parseInt(countResult.rows[0].count);
  
  return { tickets: result.rows, total };
}

export async function getTicketById(id: number): Promise<Ticket | null> {
  const result = await db.query(queries.getTicketByIdQuery, [id]);
  return result.rows[0] || null;
}

export async function updateTicket(id: number, ticket: TicketUpdate): Promise<Ticket | null> {
  const { title, description, status, priority, categoryId, assignedTo } = ticket;
  
  const result = await db.query(queries.updateTicketQuery, [
    id, title, description, status, priority, categoryId, assignedTo
  ]);
  
  return result.rows[0] || null;
}

export async function deleteTicket(id: number): Promise<boolean> {
  const result = await db.query(queries.deleteTicketQuery, [id]);
  return result.rowCount > 0;
}