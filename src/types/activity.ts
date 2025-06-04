export interface TicketActivity {
  id: string;
  ticket_id: string;
  user_id: string;
  user_name?: string;
  action: string;
  details: Record<string, any>;
  created_at: string;
}