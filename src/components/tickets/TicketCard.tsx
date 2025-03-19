// src/components/tickets/TicketCard.tsx
import Link from 'next/link';
import { Ticket, TicketStatus, TicketPriority } from '@/types/ticket';
import { formatDistanceToNow } from 'date-fns';

// Status badge colors
const statusColors: Record<TicketStatus, string> = {
  [TicketStatus.OPEN]: 'bg-blue-100 text-blue-800',
  [TicketStatus.ASSIGNED]: 'bg-purple-100 text-purple-800',
  [TicketStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
  [TicketStatus.WAITING]: 'bg-orange-100 text-orange-800',
  [TicketStatus.RESOLVED]: 'bg-green-100 text-green-800',
  [TicketStatus.CLOSED]: 'bg-gray-100 text-gray-800'
};

// Priority badge colors
const priorityColors: Record<TicketPriority, string> = {
  [TicketPriority.LOW]: 'bg-gray-100 text-gray-800',
  [TicketPriority.MEDIUM]: 'bg-blue-100 text-blue-800',
  [TicketPriority.HIGH]: 'bg-orange-100 text-orange-800',
  [TicketPriority.CRITICAL]: 'bg-red-100 text-red-800'
};

interface TicketCardProps {
  ticket: Ticket;
}

export default function TicketCard({ ticket }: TicketCardProps) {
  // Format created date as "x time ago"
  const timeAgo = formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true });
  
  return (
    <Link href={`/tickets/${ticket.id}`} className="block">
      <div className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
        <div className="flex justify-between">
          <h3 className="text-lg font-medium text-gray-900">{ticket.title}</h3>
          
          <div className="flex gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[ticket.status as TicketStatus]}`}>
              {ticket.status.replace(/_/g, ' ')}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[ticket.priority as TicketPriority]}`}>
              {ticket.priority}
            </span>
          </div>
        </div>
        
        <p className="mt-2 text-sm text-gray-500 line-clamp-2">
          {ticket.description}
        </p>
        
        <div className="mt-4 flex flex-wrap justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <span className="font-medium">Category:</span> 
            <span className="ml-1">{ticket.category}</span>
          </div>
          
          <div className="flex items-center">
            <span className="font-medium">Created:</span>
            <span className="ml-1">{timeAgo}</span>
            <span className="mx-1">by</span>
            <span>{ticket.created_by_name}</span>
          </div>
          
          <div className="flex items-center">
            <span className="font-medium">Assigned to:</span>
            <span className="ml-1">
              {ticket.assignee_name || 'Unassigned'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}