// import { db } from '../index';
// import * as queries from '../queries/tickets';
// import { Ticket, TicketCreate, TicketUpdate } from '@/types/ticket';

// export async function createTicket(ticket: TicketCreate): Promise<Ticket> {
//   const { title, description, status, priority, categoryId, createdBy, assignedTo } = ticket;
  
//   const result = await db.query(queries.createTicketQuery, [
//     title, description, status, priority, 
//     categoryId, createdBy, assignedTo || null
//   ]);
  
//   return result.rows[0];
// }

// export async function getTickets(
//   filters: { status?: string; priority?: number; categoryId?: number; assignedTo?: number },
//   page = 1,
//   limit = 10
// ): Promise<{ tickets: Ticket[]; total: number }> {
//   const offset = (page - 1) * limit;
//   const { status, priority, categoryId, assignedTo } = filters;
  
//   const result = await db.query(queries.getTicketsQuery, [
//     status || null,
//     priority || null,
//     categoryId || null,
//     assignedTo || null,
//     limit,
//     offset
//   ]);
  
//   const countResult = await db.query('SELECT COUNT(*) FROM tickets');
//   const total = parseInt(countResult.rows[0].count);
  
//   return { tickets: result.rows, total };
// }

// export async function getTicketById(id: number): Promise<Ticket | null> {
//   const result = await db.query(queries.getTicketByIdQuery, [id]);
//   return result.rows[0] || null;
// }

// export async function updateTicket(id: number, ticket: TicketUpdate): Promise<Ticket | null> {
//   const { title, description, status, priority, categoryId, assignedTo } = ticket;
  
//   const result = await db.query(queries.updateTicketQuery, [
//     id, title, description, status, priority, categoryId, assignedTo
//   ]);
  
//   return result.rows[0] || null;
// }

// export async function deleteTicket(id: number): Promise<boolean> {
//   const result = await db.query(queries.deleteTicketQuery, [id]);
//   return result.rowCount > 0;
// }

// src/lib/db/services/ticketService.ts
import { query, transaction } from '../index';
import { 
  Ticket, 
  Comment, 
  CreateTicketData, 
  UpdateTicketData, 
  TicketActivity,
  TicketStatus,
  TicketPriority 
} from '@/types/ticket';

export const ticketService = {
  // Get tickets with filters and pagination
  async getTickets(filters: {
    status?: TicketStatus;
    priority?: TicketPriority;
    assignee_id?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;
    
    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramCount = 0;
    
    if (filters.status) {
      whereConditions.push(`t.status = $${++paramCount}`);
      params.push(filters.status);
    }
    
    if (filters.priority) {
      whereConditions.push(`t.priority = $${++paramCount}`);
      params.push(filters.priority);
    }
    
    if (filters.assignee_id) {
      whereConditions.push(`t.assignee_id = $${++paramCount}`);
      params.push(filters.assignee_id);
    }
    
    if (filters.search) {
      whereConditions.push(`(t.title ILIKE $${++paramCount} OR t.description ILIKE $${paramCount})`);
      params.push(`%${filters.search}%`);
    }
    
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';
    
    // Get total count
    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) FROM tickets t ${whereClause}`,
      params
    );
    
    const total = parseInt(countResult.rows[0].count);
    
    // Add pagination params
    params.push(limit);
    params.push(offset);
    
    // Get paginated tickets
    const ticketsResult = await query<Ticket>(
      `SELECT 
        t.*,
        u1.name as created_by_name,
        u2.name as assignee_name,
        u3.name as customer_name,
        COUNT(c.id) as comment_count
      FROM tickets t
      LEFT JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.assignee_id = u2.id
      LEFT JOIN users u3 ON t.customer_id = u3.id
      LEFT JOIN comments c ON t.id = c.ticket_id
      ${whereClause}
      GROUP BY t.id, u1.name, u2.name, u3.name
      ORDER BY t.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      params
    );
    
    return {
      tickets: ticketsResult.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  },
  
  // Get single ticket with all details
  async getTicketById(id: string) {
    const ticketResult = await query<Ticket>(
      `SELECT 
        t.*,
        u1.name as created_by_name,
        u2.name as assignee_name,
        u3.name as customer_name
      FROM tickets t
      LEFT JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.assignee_id = u2.id
      LEFT JOIN users u3 ON t.customer_id = u3.id
      WHERE t.id = $1`,
      [id]
    );
    
    if (ticketResult.rows.length === 0) {
      return null;
    }
    
    const ticket = ticketResult.rows[0];
    
    // Get comments
    const comments = await this.getTicketComments(id);
    ticket.comments = comments;
    
    return ticket;
  },
  
  // Create new ticket
  async createTicket(data: CreateTicketData, userId: string) {
    return transaction(async (client) => {
      // Create ticket
      const ticketResult = await client.query(
        `INSERT INTO tickets (
          title, description, status, priority, category,
          created_by, customer_id, due_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          data.title,
          data.description,
          TicketStatus.OPEN,
          data.priority,
          data.category,
          userId,
          data.customer_id || null,
          data.due_date || null
        ]
      );
      
      const ticket = ticketResult.rows[0];
      
      // Calculate and set SLA times
      await this.calculateSLA(client, ticket.id, data.priority);
      
      // Log activity
      await client.query(
        `INSERT INTO activity_logs (user_id, ticket_id, action, details)
         VALUES ($1, $2, $3, $4)`,
        [userId, ticket.id, 'TICKET_CREATED', { title: data.title }]
      );
      
      return ticket;
    });
  },
  
  // Update ticket
  async updateTicket(id: string, data: UpdateTicketData, userId: string) {
    return transaction(async (client) => {
      // Build update query dynamically
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 0;
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          updates.push(`${key} = $${++paramCount}`);
          values.push(value);
        }
      });
      
      if (updates.length === 0) {
        return null;
      }
      
      values.push(id);
      
      const ticketResult = await client.query(
        `UPDATE tickets 
         SET ${updates.join(', ')}
         WHERE id = $${++paramCount}
         RETURNING *`,
        values
      );
      
      if (ticketResult.rows.length === 0) {
        return null;
      }
      
      const ticket = ticketResult.rows[0];
      
      // Log activity
      await client.query(
        `INSERT INTO activity_logs (user_id, ticket_id, action, details)
         VALUES ($1, $2, $3, $4)`,
        [userId, ticket.id, 'TICKET_UPDATED', data]
      );
      
      // Handle status changes
      if (data.status === TicketStatus.RESOLVED) {
        await client.query(
          `UPDATE tickets SET resolved_at = NOW() WHERE id = $1`,
          [id]
        );
      } else if (data.status === TicketStatus.CLOSED) {
        await client.query(
          `UPDATE tickets SET closed_at = NOW() WHERE id = $1`,
          [id]
        );
      }
      
      return ticket;
    });
  },
  
  // Get ticket comments
  async getTicketComments(ticketId: string): Promise<Comment[]> {
    const result = await query<Comment>(
      `SELECT c.*, u.name as user_name
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.ticket_id = $1
       ORDER BY c.created_at DESC`,
      [ticketId]
    );
    
    return result.rows;
  },
  
  // Add comment to ticket
  async addComment(ticketId: string, userId: string, content: string, isInternal = false) {
    return transaction(async (client) => {
      // Add comment
      const commentResult = await client.query(
        `INSERT INTO comments (ticket_id, user_id, content, is_internal)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [ticketId, userId, content, isInternal]
      );
      
      const comment = commentResult.rows[0];
      
      // Update first response time if this is the first response
      const ticketResult = await client.query(
        `UPDATE tickets 
         SET first_response_at = COALESCE(first_response_at, NOW())
         WHERE id = $1 AND assignee_id = $2
         RETURNING *`,
        [ticketId, userId]
      );
      
      // Log activity
      await client.query(
        `INSERT INTO activity_logs (user_id, ticket_id, action, details)
         VALUES ($1, $2, $3, $4)`,
        [userId, ticketId, 'COMMENT_ADDED', { comment_id: comment.id, is_internal: isInternal }]
      );
      
      return comment;
    });
  },
  
  // Get ticket activity/history
  async getTicketActivity(ticketId: string): Promise<TicketActivity[]> {
    const result = await query<TicketActivity>(
      `SELECT a.*, u.name as user_name
       FROM activity_logs a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.ticket_id = $1
       ORDER BY a.created_at DESC`,
      [ticketId]
    );
    
    return result.rows;
  },
  
  // Calculate SLA times based on priority
  async calculateSLA(client: any, ticketId: string, priority: TicketPriority) {
    const slaResult = await client.query(
      `SELECT * FROM sla_configs WHERE priority = $1`,
      [priority]
    );
    
    if (slaResult.rows.length > 0) {
      const sla = slaResult.rows[0];
      const now = new Date();
      const responseDate = new Date(now.getTime() + (sla.response_time_hours * 60 * 60 * 1000));
      const resolutionDate = new Date(now.getTime() + (sla.resolution_time_hours * 60 * 60 * 1000));
      
      await client.query(
        `UPDATE tickets 
         SET sla_response_due = $1, sla_resolution_due = $2
         WHERE id = $3`,
        [responseDate, resolutionDate, ticketId]
      );
    }
  },
  
  // Assign ticket to agent
  async assignTicket(ticketId: string, assigneeId: string | null, assignedById: string) {
    return transaction(async (client) => {
      const ticketResult = await client.query(
        `UPDATE tickets 
         SET assignee_id = $1, 
             status = CASE 
               WHEN $1 IS NOT NULL AND status = 'OPEN' THEN 'ASSIGNED'
               ELSE status 
             END
         WHERE id = $2
         RETURNING *`,
        [assigneeId, ticketId]
      );
      
      if (ticketResult.rows.length === 0) {
        return null;
      }
      
      const ticket = ticketResult.rows[0];
      
      // Log activity
      await client.query(
        `INSERT INTO activity_logs (user_id, ticket_id, action, details)
         VALUES ($1, $2, $3, $4)`,
        [
          assignedById, 
          ticketId, 
          assigneeId ? 'TICKET_ASSIGNED' : 'TICKET_UNASSIGNED', 
          { assignee_id: assigneeId }
        ]
      );
      
      // Create notification for assignee
      if (assigneeId) {
        await client.query(
          `INSERT INTO notifications (user_id, title, content, type, ticket_id)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            assigneeId,
            'New Ticket Assignment',
            `You have been assigned ticket #${ticket.ticket_number}: ${ticket.title}`,
            'ticket_assigned',
            ticketId
          ]
        );
      }
      
      return ticket;
    });
  }
};