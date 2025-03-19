// src/components/tickets/TicketList.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { TicketStatus, TicketPriority } from '@/types/ticket';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import TicketCard from './TicketCard';

// Status options for filtering
const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  ...Object.values(TicketStatus).map(status => ({
    value: status,
    label: status.replace(/_/g, ' ')
  }))
];

// Priority options for filtering
const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  ...Object.values(TicketPriority).map(priority => ({
    value: priority,
    label: priority
  }))
];

export default function TicketList() {
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
    limit: 10,
    offset: 0
  });
  
  // Fetch tickets with the current filters
  const { data, isLoading, error } = useQuery({
    queryKey: ['tickets', filters],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      
      if (filters.status) searchParams.append('status', filters.status);
      if (filters.priority) searchParams.append('priority', filters.priority);
      if (filters.search) searchParams.append('search', filters.search);
      searchParams.append('limit', filters.limit.toString());
      searchParams.append('offset', filters.offset.toString());
      
      const response = await fetch(`/api/tickets?${searchParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }
      
      return response.json();
    }
  });
  
  // Pagination handlers
  const handleNextPage = () => {
    if (data && filters.offset + filters.limit < data.total) {
      setFilters(prev => ({ 
        ...prev, 
        offset: prev.offset + prev.limit 
      }));
    }
  };
  
  const handlePrevPage = () => {
    if (filters.offset > 0) {
      setFilters(prev => ({ 
        ...prev, 
        offset: Math.max(0, prev.offset - prev.limit) 
      }));
    }
  };
  
  // Filter change handler
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      offset: 0 // Reset pagination when filters change
    }));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Tickets</h1>
        <Link href="/tickets/create">
          <Button>Create Ticket</Button>
        </Link>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h2 className="text-lg font-medium mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            name="status"
            label="Status"
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={handleFilterChange}
          />
          
          <Select
            name="priority"
            label="Priority"
            options={PRIORITY_OPTIONS}
            value={filters.priority}
            onChange={handleFilterChange}
          />
          
          <Input
            name="search"
            label="Search"
            placeholder="Search tickets..."
            value={filters.search}
            onChange={handleFilterChange}
          />
        </div>
      </div>
      
      {/* Loading, error, or empty states */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-2 text-gray-500">Loading tickets...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <p>Failed to load tickets. Please try again.</p>
        </div>
      )}
      
      {!isLoading && !error && data?.tickets.length === 0 && (
        <div className="bg-white border rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-gray-500">No tickets found</h3>
          <p className="mt-2 text-gray-400">Create a new ticket to get started</p>
          <div className="mt-4">
            <Link href="/tickets/create">
              <Button>Create Ticket</Button>
            </Link>
          </div>
        </div>
      )}
      
      {/* Ticket list */}
      {!isLoading && !error && data?.tickets.length > 0 && (
        <div className="space-y-4">
          {data.tickets.map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
          
          {/* Pagination */}
          <div className="flex justify-between items-center pt-4">
            <p className="text-sm text-gray-500">
              Showing {filters.offset + 1} to {Math.min(filters.offset + data.tickets.length, data.total)} of {data.total} tickets
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handlePrevPage}
                disabled={filters.offset === 0}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                onClick={handleNextPage}
                disabled={filters.offset + filters.limit >= data.total}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}