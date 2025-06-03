// src/app/agents/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { TicketStatus, TicketPriority } from '@/types/ticket';

interface AgentDashboardData {
  assignedTickets: any[];
  todayStats: {
    newAssigned: number;
    resolved: number;
    responseTime: number;
    slaBreaches: number;
  };
  workload: {
    activeTickets: number;
    maxTickets: number;
    utilizationPercent: number;
  };
  notifications: any[];
}

export default function AgentDashboardPage() {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState<AgentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('assigned');

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch assigned tickets
      const ticketsResponse = await fetch(`/api/tickets?assignee_id=${session?.user?.id}&status=${selectedStatus}`);
      const ticketsData = await ticketsResponse.json();
      
      // Fetch agent statistics
      const statsResponse = await fetch(`/api/agents/stats/${session?.user?.id}`);
      const statsData = await statsResponse.json();
      
      // Fetch notifications
      const notificationsResponse = await fetch(`/api/notifications?limit=5`);
      const notificationsData = await notificationsResponse.json();

      setDashboardData({
        assignedTickets: ticketsData.tickets || [],
        todayStats: statsData.todayStats || {
          newAssigned: 0,
          resolved: 0,
          responseTime: 0,
          slaBreaches: 0
        },
        workload: statsData.workload || {
          activeTickets: 0,
          maxTickets: 20,
          utilizationPercent: 0
        },
        notifications: notificationsData || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const getPriorityColor = (priority: TicketPriority) => {
    const colors = {
      [TicketPriority.LOW]: 'bg-gray-100 text-gray-800',
      [TicketPriority.MEDIUM]: 'bg-blue-100 text-blue-800',
      [TicketPriority.HIGH]: 'bg-orange-100 text-orange-800',
      [TicketPriority.CRITICAL]: 'bg-red-100 text-red-800',
    };
    return colors[priority as TicketPriority] || 'bg-gray-100';
  };

  const getStatusColor = (status: TicketStatus) => {
    const colors = {
      [TicketStatus.OPEN]: 'bg-blue-100 text-blue-800',
      [TicketStatus.ASSIGNED]: 'bg-purple-100 text-purple-800',
      [TicketStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
      [TicketStatus.WAITING]: 'bg-orange-100 text-orange-800',
      [TicketStatus.RESOLVED]: 'bg-green-100 text-green-800',
      [TicketStatus.CLOSED]: 'bg-gray-100 text-gray-800',
    };
    return colors[status as TicketStatus] || 'bg-gray-100';
  };

  if (loading) {
    return (
      <div className="tickets-container">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-2 text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tickets-container">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Agent Dashboard</h1>
        <p className="text-gray-600">Welcome back, {session?.user?.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData?.workload.activeTickets}</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500">of {dashboardData?.workload.maxTickets}</span>
              <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${dashboardData?.workload.utilizationPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Today</p>
              <p className="text-2xl font-bold text-blue-600">{dashboardData?.todayStats.newAssigned}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved Today</p>
              <p className="text-2xl font-bold text-green-600">{dashboardData?.todayStats.resolved}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">SLA Breaches</p>
              <p className={`text-2xl font-bold ${dashboardData?.todayStats.slaBreaches ? 'text-red-600' : 'text-gray-900'}`}>
                {dashboardData?.todayStats.slaBreaches}
              </p>
            </div>
            <div className={`p-3 rounded-full ${dashboardData?.todayStats.slaBreaches ? 'bg-red-100' : 'bg-gray-100'}`}>
              <svg className={`w-6 h-6 ${dashboardData?.todayStats.slaBreaches ? 'text-red-600' : 'text-gray-400'}`} 
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Tickets */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">My Tickets</h2>
              <div className="flex gap-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    fetchDashboardData();
                  }}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="assigned">Assigned to Me</option>
                  <option value="in_progress">In Progress</option>
                  <option value="waiting">Waiting</option>
                </select>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {dashboardData?.assignedTickets.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No tickets found for selected status
              </div>
            ) : (
              dashboardData?.assignedTickets.map((ticket) => (
                <div key={ticket.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Link 
                          href={`/tickets/${ticket.id}`}
                          className="text-lg font-medium text-blue-600 hover:text-blue-800"
                        >
                          #{ticket.ticket_number}
                        </Link>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        {ticket.sla_breached && (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            SLA Breached
                          </span>
                        )}
                      </div>
                      <h3 className="text-gray-900 font-medium mb-1">{ticket.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{ticket.description}</p>
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <span>Category: {ticket.category}</span>
                        <span className="mx-2">•</span>
                        <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace(/_/g, ' ')}
                      </span>
                      
                      <select
                        value={ticket.status}
                        onChange={(e) => handleTicketStatusChange(ticket.id, e.target.value as TicketStatus)}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value={TicketStatus.ASSIGNED}>Assigned</option>
                        <option value={TicketStatus.IN_PROGRESS}>In Progress</option>
                        <option value={TicketStatus.WAITING}>Waiting</option>
                        <option value={TicketStatus.RESOLVED}>Resolved</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notifications and Quick Actions */}
        <div className="space-y-6">
          {/* Recent Notifications */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">Recent Notifications</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {dashboardData?.notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No notifications
                </div>
              ) : (
                dashboardData?.notifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className="p-4">
                    <div className="flex items-start">
                      <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${notification.read ? 'bg-gray-300' : 'bg-blue-500'}`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-gray-200">
              <Link href="/notifications" className="text-sm text-blue-600 hover:text-blue-800">
                View all notifications →
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">Quick Actions</h3>
            </div>
            <div className="p-4 space-y-3">
              <Link
                href="/tickets"
                className="flex items-center p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                View All Tickets
              </Link>
              
              <Link
                href="/tickets/create"
                className="flex items-center p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Ticket
              </Link>
              
              <Link
                href="/agents/preferences"
                className="flex items-center p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                My Preferences
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}