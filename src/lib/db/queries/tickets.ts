// src/lib/db/queries/tickets.ts
import { query, transaction, TransactionFunction } from '../index';
import { Ticket, TicketStatus, TicketPriority, NewTicket, TicketUpdate } from '@/types/ticket';

export async function getTickets(
  limit: number = 50,
  offset: number = 0,
  filters?: {
    status?: TicketStatus;
    assignee_id?: string;
    customer_id?: string;
    created_by?: string;
    priority?: TicketPriority;
    search?: string;
  }
): Promise<{ tickets: Ticket[]; total: number }> {
  // Build WHERE clause based on filters
  const conditions: string[] = ['1=1']; // Always true to simplify query building
  const params: any[] = [];
  
  if (filters?.status) {
    conditions.push(`t.status = $${params.length + 1}`);
    params.push(filters.status);
  }
  
  if (filters?.assignee_id) {
    conditions.push(`t.assignee_id = $${params.length + 1}`);
    params.push(filters.assignee_id);
  }
  
  if (filters?.customer_id) {
    conditions.push(`t.customer_id = $${params.length + 1}`);
    params.push(filters.customer_id);
  }
  
  if (filters?.created_by) {
    conditions.push(`t.created_by = $${params.length + 1}`);
    params.push(filters.created_by);
  }
  
  if (filters?.priority) {
    conditions.push(`t.priority = $${params.length + 1}`);
    params.push(filters.priority);
  }
  
  if (filters?.search) {
    conditions.push(`(t.title ILIKE $${params.length + 1} OR t.description ILIKE $${params.length + 1})`);
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm);
  }
  
  const whereClause = conditions.join(' AND ');
  
  // Get total count for pagination
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) FROM tickets t WHERE ${whereClause}`,
    params
  );
  
  const total = parseInt(countResult.rows[0].count);
  
  // Add pagination parameters
  params.push(limit, offset);
  
  // Get paginated results with joined user data
  const result = await query<Ticket>(
    `SELECT 
      t.*,
      creator.name as created_by_name,
      assignee.name as assignee_name
    FROM 
      tickets t
    JOIN 
      users creator ON t.created_by = creator.id
    LEFT JOIN 
      users assignee ON t.assignee_id = assignee.id
    WHERE 
      ${whereClause}
    ORDER BY 
      t.created_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  
  return {
    tickets: result.rows,
    total
  };
}

export async function getTicketById(id: string): Promise<Ticket | null> {
  const result = await query<Ticket>(
    `SELECT 
      t.*,
      creator.name as created_by_name,
      assignee.name as assignee_name
    FROM 
      tickets t
    JOIN 
      users creator ON t.created_by = creator.id
    LEFT JOIN 
      users assignee ON t.assignee_id = assignee.id
    WHERE 
      t.id = $1`,
    [id]
  );
  
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function createTicket(
  newTicket: NewTicket,
  userId: string
): Promise<Ticket> {
  const txFunction: TransactionFunction<Ticket> = async (client) => {
    // Insert ticket
    const ticketResult = await client.query(
      `INSERT INTO tickets (
        title, description, status, priority, 
        created_by, category, customer_id, due_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        newTicket.title,
        newTicket.description,
        newTicket.status || TicketStatus.OPEN,
        newTicket.priority || TicketPriority.MEDIUM,
        userId,
        newTicket.category,
        newTicket.customer_id || null,
        newTicket.due_date || null
      ]
    );
    
    const ticket = ticketResult.rows[0];
    
    // Create audit log
    await client.query(
      `INSERT INTO activity_logs (
        user_id, ticket_id, action, details
      ) VALUES ($1, $2, $3, $4)`,
      [
        userId,
        ticket.id,
        'TICKET_CREATED',
        JSON.stringify({ ticket: { id: ticket.id, title: ticket.title } })
      ]
    );
    
    // Get created_by user name
    const userResult = await client.query(
      `SELECT name FROM users WHERE id = $1`,
      [userId]
    );
    
    if (userResult.rows.length > 0) {
      ticket.created_by_name = userResult.rows[0].name;
    }
    
    return ticket;
  };
  
  return transaction(txFunction);
}

export async function updateTicket(
  id: string,
  updates: TicketUpdate,
  userId: string
): Promise<Ticket> {
  // Build SET clause dynamically based on provided updates
  const updateFields: string[] = [];
  const values: any[] = [];
  
  // Handle each possible update field
  if (updates.title !== undefined) {
    updateFields.push(`title = $${values.length + 1}`);
    values.push(updates.title);
  }
  
  if (updates.description !== undefined) {
    updateFields.push(`description = $${values.length + 1}`);
    values.push(updates.description);
  }
  
  if (updates.status !== undefined) {
    updateFields.push(`status = $${values.length + 1}`);
    values.push(updates.status);
  }
  
  if (updates.priority !== undefined) {
    updateFields.push(`priority = $${values.length + 1}`);
    values.push(updates.priority);
  }
  
  if (updates.assignee_id !== undefined) {
    updateFields.push(`assignee_id = $${values.length + 1}`);
    values.push(updates.assignee_id);
  }
  
  if (updates.category !== undefined) {
    updateFields.push(`category = $${values.length + 1}`);
    values.push(updates.category);
  }
  
  if (updates.due_date !== undefined) {
    updateFields.push(`due_date = $${values.length + 1}`);
    values.push(updates.due_date);
  }
  
  if (updates.resolution !== undefined) {
    updateFields.push(`resolution = $${values.length + 1}`);
    values.push(updates.resolution);
  }
  
  // Add the ticket ID to the values array
  values.push(id);
  
  const txFunction: TransactionFunction<Ticket> = async (client) => {
    // Update the ticket
    const ticketResult = await client.query(
      `UPDATE tickets 
      SET ${updateFields.join(', ')} 
      WHERE id = $${values.length} 
      RETURNING *`,
      values
    );
    
    if (ticketResult.rows.length === 0) {
      throw new Error(`Ticket with ID ${id} not found`);
    }
    
    const ticket = ticketResult.rows[0];
    
    // Create audit log
    await client.query(
      `INSERT INTO activity_logs (
        user_id, ticket_id, action, details
      ) VALUES ($1, $2, $3, $4)`,
      [
        userId,
        id,
        'TICKET_UPDATED',
        JSON.stringify({ 
          updates: Object.keys(updates).reduce((acc, key) => {
            if (updates[key as keyof TicketUpdate] !== undefined) {
              acc[key] = updates[key as keyof TicketUpdate];
            }
            return acc;
          }, {} as Record<string, any>)
        })
      ]
    );
    
    // Get creator and assignee names
    const userResult = await client.query(
      `SELECT u1.name as created_by_name, u2.name as assignee_name
       FROM users u1
       LEFT JOIN users u2 ON u2.id = $2
       WHERE u1.id = $1`,
      [ticket.created_by, ticket.assignee_id]
    );
    
    if (userResult.rows.length > 0) {
      ticket.created_by_name = userResult.rows[0].created_by_name;
      ticket.assignee_name = userResult.rows[0].assignee_name;
    }
    
    return ticket;
  };
  
  return transaction(txFunction);
}

export async function deleteTicket(
  id: string, 
  userId: string
): Promise<void> {
  const txFunction: TransactionFunction<void> = async (client) => {
    // Check if ticket exists
    const checkResult = await client.query(
      'SELECT id, title FROM tickets WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      throw new Error(`Ticket with ID ${id} not found`);
    }
    
    const ticket = checkResult.rows[0];
    
    // Create audit log before deletion
    await client.query(
      `INSERT INTO activity_logs (
        user_id, action, details
      ) VALUES ($1, $2, $3)`,
      [
        userId,
        'TICKET_DELETED',
        JSON.stringify({ ticket: { id, title: ticket.title } })
      ]
    );
    
    // Delete the ticket
    await client.query('DELETE FROM tickets WHERE id = $1', [id]);
  };
  
  return transaction(txFunction);
}

export async function assignTicket(
  ticketId: string,
  assigneeId: string | null,
  assignedById: string
): Promise<Ticket> {
  const txFunction: TransactionFunction<Ticket> = async (client) => {
    // Update ticket assignment
    const ticketResult = await client.query(
      `UPDATE tickets 
      SET 
        assignee_id = $1, 
        status = CASE 
          WHEN status = 'OPEN' THEN 'ASSIGNED' 
          ELSE status 
        END
      WHERE id = $2
      RETURNING *`,
      [assigneeId, ticketId]
    );
    
    if (ticketResult.rows.length === 0) {
      throw new Error(`Ticket with ID ${ticketId} not found`);
    }
    
    const ticket = ticketResult.rows[0];
    
    // Create audit log
    await client.query(
      `INSERT INTO activity_logs (
        user_id, ticket_id, action, details
      ) VALUES ($1, $2, $3, $4)`,
      [
        assignedById,
        ticketId,
        assigneeId ? 'TICKET_ASSIGNED' : 'TICKET_UNASSIGNED',
        JSON.stringify({ assigneeId })
      ]
    );
    
    // Get creator and assignee names
    const userResult = await client.query(
      `SELECT u1.name as created_by_name, u2.name as assignee_name
       FROM users u1
       LEFT JOIN users u2 ON u2.id = $2
       WHERE u1.id = $1`,
      [ticket.created_by, ticket.assignee_id]
    );
    
    if (userResult.rows.length > 0) {
      ticket.created_by_name = userResult.rows[0].created_by_name;
      ticket.assignee_name = userResult.rows[0].assignee_name;
    }
    
    // Create notification for assignee if assigned
    if (assigneeId) {
      await client.query(
        `INSERT INTO notifications (
          user_id, title, content, ticket_id
        ) VALUES ($1, $2, $3, $4)`,
        [
          assigneeId,
          'Ticket Assigned',
          `You have been assigned ticket #${ticketId}: ${ticket.title}`,
          ticketId
        ]
      );
    }
    
    return ticket;
  };
  
  return transaction(txFunction);
}

// Create ticket query
export const createTicketQuery = `
  INSERT INTO tickets (
    title, description, status, priority, 
    category_id, created_by, assigned_to
  ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
  RETURNING *;
`;

// Get tickets with pagination and filters
export const getTicketsQuery = `
  SELECT t.*, u.full_name as assigned_to_name, 
    c.name as category_name
  FROM tickets t
  LEFT JOIN users u ON t.assigned_to = u.id
  LEFT JOIN categories c ON t.category_id = c.id
  WHERE ($1::text IS NULL OR t.status = $1)
    AND ($2::integer IS NULL OR t.priority = $2)
    AND ($3::integer IS NULL OR t.category_id = $3)
    AND ($4::integer IS NULL OR t.assigned_to = $4)
  ORDER BY t.created_at DESC
  LIMIT $5 OFFSET $6;
`;

// Get single ticket with details
export const getTicketByIdQuery = `
  SELECT t.*, 
    u1.full_name as created_by_name,
    u2.full_name as assigned_to_name,
    c.name as category_name
  FROM tickets t
  LEFT JOIN users u1 ON t.created_by = u1.id
  LEFT JOIN users u2 ON t.assigned_to = u2.id
  LEFT JOIN categories c ON t.category_id = c.id
  WHERE t.id = $1;
`;

// Update ticket
export const updateTicketQuery = `
  UPDATE tickets
  SET title = $2, description = $3, status = $4,
    priority = $5, category_id = $6, assigned_to = $7,
    updated_at = NOW()
  WHERE id = $1
  RETURNING *;
`;

// Delete ticket
export const deleteTicketQuery = `
  DELETE FROM tickets WHERE id = $1;
`;