// src/lib/db/services/assignmentService.ts
import { query, transaction } from '../index';
import * as queries from '../queries/assignments';
import { Ticket } from '@/types/ticket';
import { ticketService } from './ticketService';

export interface Agent {
  id: string;
  name: string;
  email: string;
  active_tickets: number;
  assigned_tickets: number;
  in_progress_tickets: number;
  resolved_today: number;
  max_tickets: number;
  preferred_categories: string[];
  preferred_priorities: string[];
  match_score?: number;
}

export interface AssignmentRule {
  id: string;
  name: string;
  rule_type: 'round_robin' | 'load_balanced' | 'skill_based' | 'priority_based';
  priority: number;
  conditions: any;
  active: boolean;
}

export const assignmentService = {
  // Get all agents with workload
  async getAgentsWithWorkload(): Promise<Agent[]> {
    const result = await query<Agent>(queries.getAgentsWithWorkload);
    return result.rows;
  },
  
  // Get available agents for a specific ticket
  async getAvailableAgentsForTicket(ticketId: string): Promise<Agent[]> {
    const result = await query<Agent>(queries.getAvailableAgentsForTicket, [ticketId]);
    return result.rows;
  },
  
  // Auto-assign ticket based on rules
  async autoAssignTicket(ticketId: string): Promise<Ticket | null> {
    return transaction(async (client) => {
      // Get ticket details
      const ticketResult = await client.query(
        'SELECT * FROM tickets WHERE id = $1',
        [ticketId]
      );
      
      if (ticketResult.rows.length === 0) {
        throw new Error('Ticket not found');
      }
      
      const ticket = ticketResult.rows[0];
      
      // Get active assignment rules
      const rulesResult = await client.query(
        'SELECT * FROM assignment_rules WHERE active = true ORDER BY priority DESC'
      );
      
      const rules = rulesResult.rows as AssignmentRule[];
      
      let selectedAgentId: string | null = null;
      
      // Apply rules in priority order
      for (const rule of rules) {
        if (rule.rule_type === 'priority_based' && rule.conditions.priorities?.includes(ticket.priority)) {
          // Find senior agent with least workload
          const agentResult = await client.query(
            `SELECT u.id 
             FROM users u
             LEFT JOIN tickets t ON u.id = t.assignee_id AND t.status IN ('ASSIGNED', 'IN_PROGRESS')
             WHERE u.role IN ('MANAGER', 'ADMIN') AND u.active = true
             GROUP BY u.id
             HAVING COUNT(t.id) < 10
             ORDER BY COUNT(t.id) ASC
             LIMIT 1`
          );
          
          if (agentResult.rows.length > 0) {
            selectedAgentId = agentResult.rows[0].id;
            break;
          }
        } else if (rule.rule_type === 'skill_based') {
          // Find agent with matching category preference
          const agentResult = await client.query(
            `SELECT u.id 
             FROM users u
             JOIN agent_preferences ap ON u.id = ap.user_id
             LEFT JOIN tickets t ON u.id = t.assignee_id AND t.status IN ('ASSIGNED', 'IN_PROGRESS')
             WHERE u.role IN ('AGENT', 'ADMIN', 'MANAGER') 
               AND u.active = true
               AND $1 = ANY(ap.categories)
             GROUP BY u.id, ap.max_tickets
             HAVING COUNT(t.id) < ap.max_tickets
             ORDER BY COUNT(t.id) ASC
             LIMIT 1`,
            [ticket.category]
          );
          
          if (agentResult.rows.length > 0) {
            selectedAgentId = agentResult.rows[0].id;
            break;
          }
        } else if (rule.rule_type === 'round_robin') {
          // Get last assigned agent for this category
          const lastAssignedResult = await client.query(
            'SELECT last_assigned_user_id FROM round_robin_state WHERE category = $1',
            [ticket.category]
          );
          
          // Get next agent in rotation
          const agentResult = await client.query(
            `SELECT u.id 
             FROM users u
             LEFT JOIN tickets t ON u.id = t.assignee_id AND t.status IN ('ASSIGNED', 'IN_PROGRESS')
             WHERE u.role IN ('AGENT', 'ADMIN', 'MANAGER') 
               AND u.active = true
               AND ($1::uuid IS NULL OR u.id > $1)
             GROUP BY u.id
             HAVING COUNT(t.id) < 20
             ORDER BY u.id ASC
             LIMIT 1`,
            [lastAssignedResult.rows[0]?.last_assigned_user_id || null]
          );
          
          if (agentResult.rows.length > 0) {
            selectedAgentId = agentResult.rows[0].id;
            
            // Update round-robin state
            await client.query(
              `INSERT INTO round_robin_state (category, last_assigned_user_id, last_assigned_at)
               VALUES ($1, $2, CURRENT_TIMESTAMP)
               ON CONFLICT (category) 
               DO UPDATE SET last_assigned_user_id = $2, last_assigned_at = CURRENT_TIMESTAMP`,
              [ticket.category, selectedAgentId]
            );
            break;
          }
        } else if (rule.rule_type === 'load_balanced') {
          // Simply get agent with least workload
          const agentResult = await client.query(
            `SELECT u.id 
             FROM users u
             LEFT JOIN tickets t ON u.id = t.assignee_id AND t.status IN ('ASSIGNED', 'IN_PROGRESS')
             LEFT JOIN agent_preferences ap ON u.id = ap.user_id
             WHERE u.role IN ('AGENT', 'ADMIN', 'MANAGER') 
               AND u.active = true
             GROUP BY u.id, ap.max_tickets
             HAVING COUNT(t.id) < COALESCE(ap.max_tickets, 20)
             ORDER BY COUNT(t.id) ASC
             LIMIT 1`
          );
          
          if (agentResult.rows.length > 0) {
            selectedAgentId = agentResult.rows[0].id;
            break;
          }
        }
      }
      
      if (!selectedAgentId) {
        // No agent found, leave unassigned
        return null;
      }
      
      // Assign the ticket
      const assignedTicketResult = await client.query(
        queries.assignTicketToAgent,
        [ticketId, selectedAgentId]
      );
      
      const assignedTicket = assignedTicketResult.rows[0];
      
      // Log the assignment
      await client.query(
        `INSERT INTO activity_logs (user_id, ticket_id, action, details)
         VALUES ($1, $2, 'TICKET_AUTO_ASSIGNED', $3)`,
        [selectedAgentId, ticketId, { assignee_id: selectedAgentId, method: 'auto' }]
      );
      
      // Create notification
      await client.query(
        `INSERT INTO notifications (user_id, title, content, type, ticket_id)
         VALUES ($1, $2, $3, 'ticket_assigned', $4)`,
        [
          selectedAgentId,
          'New Ticket Assignment',
          `You have been automatically assigned ticket #${assignedTicket.ticket_number}: ${assignedTicket.title}`,
          ticketId
        ]
      );
      
      return assignedTicket;
    });
  },
  
  // Manual assign ticket
  async assignTicket(ticketId: string, agentId: string, assignedById: string): Promise<Ticket | null> {
    return transaction(async (client) => {
      // Check if agent is available
      const agentResult = await client.query(
        `SELECT u.id, u.name, 
          COUNT(t.id) FILTER (WHERE t.status IN ('ASSIGNED', 'IN_PROGRESS')) as active_tickets,
          COALESCE(ap.max_tickets, 20) as max_tickets
         FROM users u
         LEFT JOIN tickets t ON u.id = t.assignee_id
         LEFT JOIN agent_preferences ap ON u.id = ap.user_id
         WHERE u.id = $1 AND u.active = true
         GROUP BY u.id, u.name, ap.max_tickets`,
        [agentId]
      );
      
      if (agentResult.rows.length === 0) {
        throw new Error('Agent not found or inactive');
      }
      
      const agent = agentResult.rows[0];
      
      if (agent.active_tickets >= agent.max_tickets) {
        throw new Error(`Agent ${agent.name} has reached maximum ticket capacity (${agent.max_tickets})`);
      }
      
      // Get current assignee (if any) for notification
      const currentAssigneeResult = await client.query(
        'SELECT assignee_id FROM tickets WHERE id = $1',
        [ticketId]
      );
      
      const previousAssigneeId = currentAssigneeResult.rows[0]?.assignee_id;
      
      // Assign the ticket
      const ticketResult = await client.query(
        queries.assignTicketToAgent,
        [ticketId, agentId]
      );
      
      if (ticketResult.rows.length === 0) {
        throw new Error('Failed to assign ticket');
      }
      
      const ticket = ticketResult.rows[0];
      
      // Log the assignment
      await client.query(
        `INSERT INTO activity_logs (user_id, ticket_id, action, details)
         VALUES ($1, $2, $3, $4)`,
        [
          assignedById,
          ticketId,
          previousAssigneeId ? 'TICKET_REASSIGNED' : 'TICKET_ASSIGNED',
          { 
            assignee_id: agentId, 
            previous_assignee_id: previousAssigneeId,
            assigned_by: assignedById 
          }
        ]
      );
      
      // Create notification for new assignee
      await client.query(
        `INSERT INTO notifications (user_id, title, content, type, ticket_id)
         VALUES ($1, $2, $3, 'ticket_assigned', $4)`,
        [
          agentId,
          'New Ticket Assignment',
          `You have been assigned ticket #${ticket.ticket_number}: ${ticket.title}`,
          ticketId
        ]
      );
      
      // If reassigned, notify previous assignee
      if (previousAssigneeId && previousAssigneeId !== agentId) {
        await client.query(
          `INSERT INTO notifications (user_id, title, content, type, ticket_id)
           VALUES ($1, $2, $3, 'ticket_reassigned', $4)`,
          [
            previousAssigneeId,
            'Ticket Reassigned',
            `Ticket #${ticket.ticket_number} has been reassigned to another agent`,
            ticketId
          ]
        );
      }
      
      return ticket;
    });
  },
  
  // Unassign ticket
  async unassignTicket(ticketId: string, unassignedById: string): Promise<Ticket | null> {
    return transaction(async (client) => {
      // Get current assignee
      const currentResult = await client.query(
        'SELECT assignee_id FROM tickets WHERE id = $1',
        [ticketId]
      );
      
      const previousAssigneeId = currentResult.rows[0]?.assignee_id;
      
      // Unassign the ticket
      const ticketResult = await client.query(
        queries.unassignTicket,
        [ticketId]
      );
      
      if (ticketResult.rows.length === 0) {
        throw new Error('Failed to unassign ticket');
      }
      
      const ticket = ticketResult.rows[0];
      
      // Log the unassignment
      await client.query(
        `INSERT INTO activity_logs (user_id, ticket_id, action, details)
         VALUES ($1, $2, 'TICKET_UNASSIGNED', $3)`,
        [
          unassignedById,
          ticketId,
          { 
            previous_assignee_id: previousAssigneeId,
            unassigned_by: unassignedById 
          }
        ]
      );
      
      // Notify previous assignee
      if (previousAssigneeId) {
        await client.query(
          `INSERT INTO notifications (user_id, title, content, type, ticket_id)
           VALUES ($1, $2, $3, 'ticket_unassigned', $4)`,
          [
            previousAssigneeId,
            'Ticket Unassigned',
            `Ticket #${ticket.ticket_number} has been unassigned from you`,
            ticketId
          ]
        );
      }
      
      return ticket;
    });
  },
  
  // Bulk assign tickets
  async bulkAssignTickets(ticketIds: string[], agentId: string, assignedById: string): Promise<Ticket[]> {
    return transaction(async (client) => {
      // Check agent capacity
      const capacityResult = await client.query(
        `SELECT 
          COUNT(t.id) FILTER (WHERE t.status IN ('ASSIGNED', 'IN_PROGRESS')) as active_tickets,
          COALESCE(ap.max_tickets, 20) as max_tickets
         FROM users u
         LEFT JOIN tickets t ON u.id = t.assignee_id
         LEFT JOIN agent_preferences ap ON u.id = ap.user_id
         WHERE u.id = $1
         GROUP BY ap.max_tickets`,
        [agentId]
      );
      
      const capacity = capacityResult.rows[0];
      const availableSlots = capacity.max_tickets - capacity.active_tickets;
      
      if (ticketIds.length > availableSlots) {
        throw new Error(`Agent can only accept ${availableSlots} more tickets`);
      }
      
      // Bulk assign
      const result = await client.query(
        queries.bulkAssignTickets,
        [ticketIds, agentId]
      );
      
      const assignedTickets = result.rows;
      
      // Log bulk assignment
      for (const ticket of assignedTickets) {
        await client.query(
          `INSERT INTO activity_logs (user_id, ticket_id, action, details)
           VALUES ($1, $2, 'TICKET_ASSIGNED', $3)`,
          [assignedById, ticket.id, { assignee_id: agentId, bulk_assignment: true }]
        );
      }
      
      // Create single notification for bulk assignment
      if (assignedTickets.length > 0) {
        await client.query(
          `INSERT INTO notifications (user_id, title, content, type)
           VALUES ($1, $2, $3, 'bulk_assignment')`,
          [
            agentId,
            'Bulk Ticket Assignment',
            `You have been assigned ${assignedTickets.length} new tickets`,
          ]
        );
      }
      
      return assignedTickets;
    });
  },
  
  // Get assignment history
  async getTicketAssignmentHistory(ticketId: string) {
    const result = await query(queries.getTicketAssignmentHistory, [ticketId]);
    return result.rows;
  },
  
  // Get agent statistics
  async getAgentStatistics() {
    const result = await query(queries.getAgentStatistics);
    return result.rows;
  },
  
  // Update agent preferences
  async updateAgentPreferences(agentId: string, preferences: {
    max_tickets?: number;
    categories?: string[];
    priorities?: string[];
    auto_assign_enabled?: boolean;
  }) {
    return transaction(async (client) => {
      const updates: string[] = [];
      const values: any[] = [];
      
      if (preferences.max_tickets !== undefined) {
        updates.push(`max_tickets = $${values.length + 1}`);
        values.push(preferences.max_tickets);
      }
      
      if (preferences.categories !== undefined) {
        updates.push(`categories = $${values.length + 1}`);
        values.push(preferences.categories);
      }
      
      if (preferences.priorities !== undefined) {
        updates.push(`priorities = $${values.length + 1}`);
        values.push(preferences.priorities);
      }
      
      if (preferences.auto_assign_enabled !== undefined) {
        updates.push(`auto_assign_enabled = $${values.length + 1}`);
        values.push(preferences.auto_assign_enabled);
      }
      
      if (updates.length === 0) {
        return null;
      }
      
      values.push(agentId);
      
      const result = await client.query(
        `INSERT INTO agent_preferences (user_id, ${Object.keys(preferences).join(', ')})
         VALUES ($${values.length}, ${Object.keys(preferences).map((_, i) => `$${i + 1}`).join(', ')})
         ON CONFLICT (user_id)
         DO UPDATE SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        values
      );
      
      return result.rows[0];
    });
  }
};