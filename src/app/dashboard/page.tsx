// src/app/dashboard/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Dashboard | Gibela Portal',
  description: 'View your support metrics and recent activity',
};

export default function DashboardPage() {
  return (
    <div className="dashboard-container">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">CRM Dashboard</h1>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tickets..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <Link href="/tickets/create">
            <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>New Ticket</span>
            </button>
          </Link>
        </div>
      </div>
      
      {/* Ticket Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="metric-card blue">
          <div className="arrow-icon">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 13L13 1M13 1H5M13 1V9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="text-sm opacity-80 mb-1">Open Tickets</div>
          <div className="metric-value">12</div>
        </div>
        
        <div className="metric-card yellow">
          <div className="arrow-icon">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 13L13 1M13 1H5M13 1V9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="text-sm opacity-80 mb-1">In Progress</div>
          <div className="metric-value">5</div>
        </div>
        
        <div className="metric-card green">
          <div className="arrow-icon">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 13L13 1M13 1H5M13 1V9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="text-sm opacity-80 mb-1">Resolved Today</div>
          <div className="metric-value">8</div>
        </div>
      </div>
      
      {/* SLA Metrics & Ticket Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="dashboard-card md:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium">Tickets by Status</h2>
            <div className="flex space-x-2">
              <span className="badge badge-blue">Open</span>
              <span className="badge badge-yellow">In Progress</span>
              <span className="badge badge-green">Resolved</span>
              <span className="badge badge-red">SLA Breached</span>
            </div>
          </div>
          
          <div className="h-64">
            {/* Ticket status chart - Simple bar chart representation */}
            <div className="flex h-48 items-end space-x-12 mt-4 px-8">
              {[
                { label: 'New', value: 4, color: 'bg-gray-400' },
                { label: 'Open', value: 8, color: 'bg-blue-500' },
                { label: 'In Progress', value: 5, color: 'bg-yellow-500' },
                { label: 'Waiting', value: 3, color: 'bg-purple-500' },
                { label: 'Resolved', value: 8, color: 'bg-green-500' },
                { label: 'Closed', value: 12, color: 'bg-gray-700' }
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center flex-1">
                  <div 
                    className={`w-full ${item.color} rounded-t-md`} 
                    style={{ height: `${(item.value / 12) * 100}%` }}
                  ></div>
                  <div className="text-xs mt-2 text-gray-500">{item.label}</div>
                  <div className="text-sm font-medium">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="dashboard-card bg-gray-900 text-white">
          <h2 className="text-lg font-medium mb-4">SLA Performance</h2>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">Response Time</span>
              <span className="text-sm font-medium">92%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full">
              <div className="h-full bg-green-500 rounded-full" style={{ width: '92%' }}></div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">Resolution Time</span>
              <span className="text-sm font-medium">85%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full">
              <div className="h-full bg-yellow-500 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">First Contact Resolution</span>
              <span className="text-sm font-medium">78%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '78%' }}></div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">2.4h</div>
                <div className="text-xs text-gray-400">Avg. Response Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold">7.5h</div>
                <div className="text-xs text-gray-400">Avg. Resolution Time</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activity and Critical Tickets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="dashboard-card">
          <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
          
          <div className="space-y-4">
            <div className="activity-item blue">
              <p className="text-sm font-medium">Ticket #1234 was assigned to John Doe</p>
              <p className="text-xs text-gray-500">10 minutes ago</p>
            </div>
            
            <div className="activity-item green">
              <p className="text-sm font-medium">Ticket #1230 was resolved by Jane Smith</p>
              <p className="text-xs text-gray-500">1 hour ago</p>
            </div>
            
            <div className="activity-item yellow">
              <p className="text-sm font-medium">New ticket #1238 was created</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
            
            <div className="activity-item red">
              <p className="text-sm font-medium">SLA breached for ticket #1227</p>
              <p className="text-xs text-gray-500">3 hours ago</p>
            </div>
          </div>
          
          <button className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all activity
          </button>
        </div>
        
        <div className="dashboard-card">
          <h2 className="text-lg font-medium mb-4">Critical Tickets</h2>
          
          <div className="space-y-3">
            {[
              { id: '1227', title: 'Payment gateway integration issue', assignee: 'Unassigned', priority: 'Critical', sla: 'breached' },
              { id: '1225', title: 'Customer unable to access account', assignee: 'John Doe', priority: 'High', sla: 'warning' },
              { id: '1223', title: 'Mobile app crashes on login', assignee: 'Alice Chen', priority: 'High', sla: 'healthy' }
            ].map((ticket) => (
              <div key={ticket.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <span 
                        className={`sla-indicator ${
                          ticket.sla === 'healthy' ? 'sla-healthy' : 
                          ticket.sla === 'warning' ? 'sla-warning' : 
                          'sla-breached'
                        }`}
                      ></span>
                      <Link href={`/tickets/${ticket.id}`} className="font-medium hover:text-blue-600">
                        #{ticket.id}: {ticket.title}
                      </Link>
                    </div>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-gray-500">Assigned to: {ticket.assignee}</span>
                    </div>
                  </div>
                  <span className={`
                    badge ${
                      ticket.priority === 'Critical' ? 'badge-red' : 
                      ticket.priority === 'High' ? 'badge-yellow' : 
                      'badge-blue'
                    }
                  `}>
                    {ticket.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <Link href="/tickets?priority=high,critical" className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all critical tickets
          </Link>
        </div>
      </div>
      
      {/* Development Mode Notice */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <h3 className="font-medium">Development Mode</h3>
        <p className="text-sm mt-1">
          You're viewing this page without authentication because you're in development mode.
          In production, users will need to be authenticated to see this page.
        </p>
      </div>
    </div>
  );
}