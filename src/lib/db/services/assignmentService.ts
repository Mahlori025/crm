import { db } from '../index';
import * as queries from '../queries/assignments';
import { Ticket } from '@/types/ticket';
import { User } from '@/types/user';
import { notifyTicketAssigned } from '@/lib/notifications/in-app';
import { sendAssignmentEmail } from '@/lib/notifications/email';

export async function assignTicket(
  ticketId: number, 
  agentId: number, 
  notifyAgent = true
): Promise<Ticket | null> {
  try {
    // Begin transaction
    await db.query('BEGIN');
    
    // Assign ticket
    const result = await db.query(queries.assignTicketQuery, [ticketId, agentId]);
    const ticket = result.rows[0];
    
    if (!ticket) {
      await db.query('ROLLBACK');
      return null;
    }
    
    // Get agent details for notification
    const agentResult = await db.query('SELECT * FROM users WHERE id = $1', [agentId]);
    const agent = agentResult.rows[0];
    
    // Send notifications if requested
    if (notifyAgent && agent) {
      await notifyTicketAssigned(agent.id, ticketId);
      await sendAssignmentEmail(agent.email, ticket);
    }
    
    // Commit transaction
    await db.query('COMMIT');
    
    return ticket;
  } catch (error) {
    // Rollback on error
    await db.query('ROLLBACK');
    console.error('Error assigning ticket:', error);
    throw error;
  }
}

export async function getAvailableAgents(): Promise<User[]> {
  const result = await db.query(queries.getAvailableAgentsQuery);
  return result.rows;
}

export async function autoAssignTicket(ticketId: number): Promise<Ticket | null> {
  try {
    // Begin transaction
    await db.query('BEGIN');
    
    // Auto-assign to agent with least workload
    const result = await db.query(queries.autoAssignTicketQuery, [ticketId]);
    const ticket = result.rows[0];
    
    if (!ticket || !ticket.assigned_to) {
      await db.query('ROLLBACK');
      return null;
    }
    
    // Get agent details for notification
    const agentResult = await db.query('SELECT * FROM users WHERE id = $1', [ticket.assigned_to]);
    const agent = agentResult.rows[0];
    
    // Send notifications
    await notifyTicketAssigned(agent.id, ticketId);
    await sendAssignmentEmail(agent.email, ticket);
    
    // Commit transaction
    await db.query('COMMIT');
    
    return ticket;
  } catch (error) {
    // Rollback on error
    await db.query('ROLLBACK');
    console.error('Error auto-assigning ticket:', error);
    throw error;
  }
}