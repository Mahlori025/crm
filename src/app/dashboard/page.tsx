// src/app/dashboard/page.tsx
//import { requireAuth } from '@/lib/auth/session';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Dashboard | CRM Ticket System',
    description: 'View your support metrics and recent activity',
  };
  
  export default function DashboardPage() {
    // Note: In production, you would add authentication here
    // But for development, we're allowing direct access
    
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-2">Open Tickets</h2>
            <p className="text-3xl font-bold text-blue-600">12</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-2">In Progress</h2>
            <p className="text-3xl font-bold text-yellow-600">5</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-2">Resolved Today</h2>
            <p className="text-3xl font-bold text-green-600">8</p>
          </div>
        </div>
        
        {/* Activity Feed */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4 py-1">
              <p className="text-sm font-medium">Ticket #1234 was assigned to John Doe</p>
              <p className="text-xs text-gray-500">10 minutes ago</p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4 py-1">
              <p className="text-sm font-medium">Ticket #1230 was resolved by Jane Smith</p>
              <p className="text-xs text-gray-500">1 hour ago</p>
            </div>
            
            <div className="border-l-4 border-yellow-500 pl-4 py-1">
              <p className="text-sm font-medium">New ticket #1238 was created</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
        </div>
        
        {/* Development notice - Will be removed in production */}
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