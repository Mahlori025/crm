// src/app/tickets/page.tsx
import { requireAuth } from '@/lib/auth/session';
import TicketList from '@/components/tickets/TicketList';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tickets | CRM Ticket System',
  description: 'View and manage support tickets',
};

export default async function TicketsPage() {
  // Verify user is authenticated
  await requireAuth();
  
  return (
    <div className="p-6">
      <TicketList />
    </div>
  );
}