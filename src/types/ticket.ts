// // src/types/ticket.ts
// import { z } from 'zod';

// export enum TicketStatus {
//   OPEN = 'OPEN',
//   ASSIGNED = 'ASSIGNED',
//   IN_PROGRESS = 'IN_PROGRESS',
//   WAITING = 'WAITING',
//   RESOLVED = 'RESOLVED',
//   CLOSED = 'CLOSED'
// }

// export enum TicketPriority {
//   LOW = 'LOW',
//   MEDIUM = 'MEDIUM',
//   HIGH = 'HIGH',
//   CRITICAL = 'CRITICAL'
// }

// export interface Ticket {
//   id: string;
//   title: string;
//   description: string;
//   status: TicketStatus;
//   priority: TicketPriority;
//   category: string;
//   created_by: string;
//   created_by_name?: string;
//   assignee_id: string | null;
//   assignee_name?: string | null;
//   customer_id: string | null;
//   due_date: string | null;
//   resolution: string | null;
//   created_at: string;
//   updated_at: string;
// }

// export interface NewTicket {
//   title: string;
//   description: string;
//   status?: TicketStatus;
//   priority?: TicketPriority;
//   category: string;
//   customer_id?: string | null;
//   due_date?: string | null;
// }

// export interface TicketUpdate {
//   title?: string;
//   description?: string;
//   status?: TicketStatus;
//   priority?: TicketPriority;
//   assignee_id?: string | null;
//   category?: string;
//   due_date?: string | null;
//   resolution?: string | null;
// }

// // Validation schemas
// export const newTicketSchema = z.object({
//   title: z.string().min(5, "Title must be at least 5 characters").max(255),
//   description: z.string().min(10, "Description must be at least 10 characters"),
//   status: z.nativeEnum(TicketStatus).optional(),
//   priority: z.nativeEnum(TicketPriority).optional(),
//   category: z.string().min(1, "Category is required"),
//   customer_id: z.string().uuid().nullable().optional(),
//   due_date: z.string().nullable().optional()
// });

// export const ticketUpdateSchema = z.object({
//   title: z.string().min(5).max(255).optional(),
//   description: z.string().min(10).optional(),
//   status: z.nativeEnum(TicketStatus).optional(),
//   priority: z.nativeEnum(TicketPriority).optional(),
//   assignee_id: z.string().uuid().nullable().optional(),
//   category: z.string().optional(),
//   due_date: z.string().nullable().optional(),
//   resolution: z.string().nullable().optional()
// });

// // Type inference from schemas
// export type ValidatedNewTicket = z.infer<typeof newTicketSchema>;
// export type ValidatedTicketUpdate = z.infer<typeof ticketUpdateSchema>;


// src/types/ticket.ts
import { z } from 'zod';

export enum TicketStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING = 'WAITING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface Ticket {
  id: string;
  ticket_number: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  created_by: string;
  created_by_name?: string;
  assignee_id: string | null;
  assignee_name?: string | null;
  customer_id: string | null;
  customer_name?: string | null;
  due_date: string | null;
  resolution: string | null;
  // SLA fields
  sla_response_due: string | null;
  sla_resolution_due: string | null;
  first_response_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  sla_breached: boolean;
  // Timestamps
  created_at: string;
  updated_at: string;
  // Relations
  comments?: Comment[];
  attachments?: Attachment[];
}

export interface Comment {
  id: string;
  ticket_id: string;
  user_id: string;
  user_name?: string;
  content: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  ticket_id?: string;
  comment_id?: string;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  uploaded_by_name?: string;
  created_at: string;
}

export interface TicketActivity {
  id: string;
  ticket_id: string;
  user_id: string;
  user_name?: string;
  action: string;
  details: Record<string, any>;
  created_at: string;
}

export interface CreateTicketData {
  title: string;
  description: string;
  priority: TicketPriority;
  category: string;
  customer_id?: string;
  due_date?: string;
  attachments?: File[];
}

export interface UpdateTicketData {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: string;
  assignee_id?: string | null;
  due_date?: string | null;
  resolution?: string | null;
}

// Validation schemas
export const createTicketSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(255),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.nativeEnum(TicketPriority),
  category: z.string().min(1, "Category is required"),
  customer_id: z.string().uuid().optional(),
  due_date: z.string().optional(),
});

export const updateTicketSchema = z.object({
  title: z.string().min(5).max(255).optional(),
  description: z.string().min(10).optional(),
  status: z.nativeEnum(TicketStatus).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  category: z.string().optional(),
  assignee_id: z.string().uuid().nullable().optional(),
  due_date: z.string().nullable().optional(),
  resolution: z.string().nullable().optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
  is_internal: z.boolean().optional().default(false),
});