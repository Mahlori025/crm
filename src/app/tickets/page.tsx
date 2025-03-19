// src/app/tickets/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Tickets | Gibela Portal',
  description: 'Manage support tickets',
};

export default function TicketsPage() {
  // Note: In production, you would add authentication here
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tickets</h1>
        <Link 
          href="/tickets/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Ticket
        </Link>
      </div>
      
      {/* Sample Tickets */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((num) => (
          <div key={num} className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
            <div className="flex justify-between">
              <h3 className="font-medium">Ticket #{1230 + num}</h3>
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Open</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Issue with login functionality on mobile devices
            </p>
            <div className="flex justify-between mt-3 text-xs text-gray-500">
              <span>Opened 2 days ago</span>
              <span>Priority: Medium</span>
              <span>Assigned to: John Doe</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Development notice */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <h3 className="font-medium">Development Mode</h3>
        <p className="text-sm mt-1">
          You're viewing this page without authentication because you're in development mode.
        </p>
      </div>
    </div>
  );
}