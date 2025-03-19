// src/app/dashboard/page.tsx
import { requireAuth } from '@/lib/auth/session';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | CRM Ticket System',
  description: 'View your support metrics and recent activity',
};

export default async function DashboardPage() {
  const session = await requireAuth();
  
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
          <p className="text-sm text-gray-500">
            Activity feed will appear here once implemented
          </p>
        </div>
      </div>
    </div>
  );
}