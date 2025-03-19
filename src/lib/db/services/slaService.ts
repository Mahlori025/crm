// src/lib/db/services/slaService.ts
import { db } from '../index';
import * as queries from '../queries/sla';
import { Ticket } from '@/types/ticket';
import { notifySlaBreached } from '@/lib/notifications/in-app';
import { sendSlaBreachEmail } from '@/lib/notifications/email';

// SLA configuration type
type SlaConfig = {
  id: number;
  priority: number;
  response_time_hours: number;
  resolution_time_hours: number;
  created_at: Date;
};

// Function to calculate SLA due dates for a ticket
export async function calculateSlaDueDates(
  ticketId: number, 
  priority: number,
  createdAt: Date = new Date()
): Promise<{responseDate: Date, resolutionDate: Date} | null> {
  try {
    // Get SLA config for this priority
    const result = await db.query(
      'SELECT * FROM sla_configs WHERE priority = $1',
      [priority]
    );
    
    const slaConfig = result.rows[0] as SlaConfig;
    if (!slaConfig) {
      console.error(`No SLA configuration for priority ${priority}`);
      return null;
    }
    
    // Calculate response due date
    const responseDate = new Date(createdAt);
    responseDate.setHours(responseDate.getHours() + slaConfig.response_time_hours);
    
    // Calculate resolution due date
    const resolutionDate = new Date(createdAt);
    resolutionDate.setHours(resolutionDate.getHours() + slaConfig.resolution_time_hours);
    
    // Update ticket with SLA dates
    await db.query(queries.updateTicketSlaQuery, [
      ticketId,
      responseDate,
      resolutionDate
    ]);
    
    return { responseDate, resolutionDate };
  } catch (error) {
    console.error('Error calculating SLA due dates:', error);
    return null;
  }
}

// Function to check for SLA breaches and notify relevant parties
export async function checkSlaBreaches(): Promise<void> {
  try {
    const result = await db.query(queries.getBreachedSlaTicketsQuery);
    const breachedTickets = result.rows as Ticket[];
    
    for (const ticket of breachedTickets) {
      // Check if this is a new breach (not previously notified)
      const alreadyNotified = await hasBreachBeenNotified(ticket.id);
      if (!alreadyNotified) {
        // Determine breach type (response or resolution)
        const breachType = !ticket.first_response_at && ticket.sla_response_due < new Date()
          ? 'response'
          : 'resolution';
        
        // Get relevant users to notify (assigned agent, supervisors)
        const usersToNotify = await getUsersToNotifyForSla(ticket.id, ticket.assigned_to);
        
        // Send notifications
        for (const userId of usersToNotify) {
          await notifySlaBreached(userId, ticket.id, breachType);
        }
        
        // If assigned to an agent, send email
        if (ticket.assigned_to) {
          const agentResult = await db.query('SELECT email FROM users WHERE id = $1', [ticket.assigned_to]);
          if (agentResult.rows.length > 0) {
            await sendSlaBreachEmail(agentResult.rows[0].email, ticket, breachType);
          }
        }
        
        // Log the notification to prevent duplicate alerts
        await logSlaBreachNotification(ticket.id, breachType);
      }
    }
  } catch (error) {
    console.error('Error checking SLA breaches:', error);
  }
}

// Helper function to check if a ticket breach has already been notified
async function hasBreachBeenNotified(ticketId: number): Promise<boolean> {
  const result = await db.query(
    'SELECT * FROM sla_breach_notifications WHERE ticket_id = $1',
    [ticketId]
  );
  return result.rows.length > 0;
}

// Helper function to log SLA breach notification
async function logSlaBreachNotification(ticketId: number, breachType: string): Promise<void> {
  await db.query(
    'INSERT INTO sla_breach_notifications (ticket_id, breach_type) VALUES ($1, $2)',
    [ticketId, breachType]
  );
}

// Helper function to get users that should be notified about SLA breaches
async function getUsersToNotifyForSla(ticketId: number, assignedAgentId?: number): Promise<number[]> {
  // Get supervisors and managers
  const supervisorResult = await db.query(
    "SELECT id FROM users WHERE role IN ('supervisor', 'manager') AND status = 'active'"
  );
  
  const supervisorIds = supervisorResult.rows.map(row => row.id);
  
  // Include assigned agent if any
  if (assignedAgentId) {
    return [assignedAgentId, ...supervisorIds];
  }
  
  return supervisorIds;
}