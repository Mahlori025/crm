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
  due_date: string | null;
  resolution: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewTicket {
  title: string;
  description: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category: string;
  customer_id?: string | null;
  due_date?: string | null;
}

export interface TicketUpdate {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assignee_id?: string | null;
  category?: string;
  due_date?: string | null;
  resolution?: string | null;
}

// Validation schemas
export const newTicketSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(255),
  description: z.string().min(10, "Description must be at least 10 characters"),
  status: z.nativeEnum(TicketStatus).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  category: z.string().min(1, "Category is required"),
  customer_id: z.string().uuid().nullable().optional(),
  due_date: z.string().nullable().optional()
});

export const ticketUpdateSchema = z.object({
  title: z.string().min(5).max(255).optional(),
  description: z.string().min(10).optional(),
  status: z.nativeEnum(TicketStatus).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  assignee_id: z.string().uuid().nullable().optional(),
  category: z.string().optional(),
  due_date: z.string().nullable().optional(),
  resolution: z.string().nullable().optional()
});

// Type inference from schemas
export type ValidatedNewTicket = z.infer<typeof newTicketSchema>;
export type ValidatedTicketUpdate = z.infer<typeof ticketUpdateSchema>;