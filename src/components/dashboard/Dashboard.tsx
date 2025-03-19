// src/components/dashboard/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import StatsCard from './StatsCard';
import TicketChart from './TicketChart';
import ActivityFeed from './ActivityFeed';
import { useTickets } from '@/hooks/useTickets';
import { useUsers } from '@/hooks/useUsers';

export default function Dashboard() {
  const { tickets, totalTickets, isLoading: ticketsLoading } = useTickets();
  const { users, isLoading: usersLoading } = useUsers();
  const [teamActivity, setTeamActivity] = useState(0);
  
  useEffect(() => {
    // Calculate team activity percentage based on ticket responses
    if (tickets) {
      const totalResponses = tickets.reduce((acc, ticket) => 
        acc + (ticket.responses?.length || 0), 0);
      setTeamActivity(Math.min(Math.round((totalResponses / Math.max(tickets.length, 1)) * 100), 100));
    }
  }, [tickets]);
  
  if (ticketsLoading || usersLoading) {
    return <div className="loading">Loading dashboard data...</div>;
  }
  
  return (
    <div className="dashboard-container bg-black text-white">
      <h1 className="text-2xl font-bold mb-6">Team Performance</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard 
          title="Total members" 
          value={users?.length || 0} 
          bgColor="bg-[#00B2CB]" 
          hasArrow={true} 
        />
        <StatsCard 
          title="Team average activity" 
          value={`${teamActivity}%`} 
          bgColor="bg-gray-800" 
        />
        <StatsCard 
          title="Earned this week" 
          value="$ 9,636" 
          bgColor="bg-gray-800" 
          hasArrow={true} 
        />
      </div>
      
      {/* Time tracking section */}
      <div className="bg-gray-900 p-4 rounded-lg mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Average Time Worked</h2>
          <span className="text-[#00B2CB] bg-[#00B2CB20] px-2 py-1 rounded-full text-sm">+1.2%</span>
        </div>
        <div className="text-4xl font-bold mb-4">7:02:51</div>
        <TicketChart />
      </div>
      
      {/* Leads by agent section */}
      <div className="bg-gray-900 p-4 rounded-lg mb-8">
        <h2 className="text-lg font-semibold mb-4">Leads by sales</h2>
        <div className="h-48">
          {/* Bar chart component showing agent performance */}
          <TicketChart type="bar" highlightIndex={3} /> {/* Highlight Lia's bar */}
        </div>
      </div>
      
      {/* Team members list */}
      <div className="bg-gray-900 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">List members</h2>
        <table className="w-full">
          <thead>
            <tr className="text-gray-400 text-sm">
              <th className="text-left pb-2">Name</th>
              <th className="text-left pb-2">Task Progress</th>
              <th className="text-left pb-2">E-mail</th>
              <th className="text-left pb-2">Role</th>
              <th className="text-left pb-2">Last activity</th>
              <th className="text-left pb-2">Team</th>
            </tr>
          </thead>
          <tbody>
            {users?.slice(0, 4).map((user, index) => (
              <tr key={user.id} className="border-t border-gray-800">
                <td className="py-4 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-red-600 mr-2 flex items-center justify-center">
                    {user.full_name?.charAt(0)}
                  </div>
                  {user.full_name}
                </td>
                <td>
                  <div className="flex items-center">
                    <div className="bg-gray-800 h-2 w-24 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#00A36C] h-full rounded-full" 
                        style={{width: `${Math.random() * 100}%`}}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm">{Math.floor(Math.random() * 20)}/{Math.floor(Math.random() * 10) + 20}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{new Date(user.last_login || Date.now()).toLocaleDateString()}</td>
                <td>
                  <div className="flex space-x-1">
                    {user.department === 'Design' && (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-600 text-white">Design</span>
                    )}
                    {user.department === 'Development' && (
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-500 text-black">Dev</span>
                    )}
                    {user.department === 'Sales' && (
                      <span className="px-2 py-1 text-xs rounded-full bg-cyan-500 text-white">Sales</span>
                    )}
                    {user.department === 'HR' && (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-600 text-white">HR</span>
                    )}
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-600 text-white">Operations</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}