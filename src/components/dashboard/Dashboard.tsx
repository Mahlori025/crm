// // src/components/dashboard/Dashboard.tsx
// import React, { useState, useEffect } from 'react';
// import StatsCard from './StatsCard';
// import TicketChart from './TicketChart';
// import ActivityFeed from './ActivityFeed';
// import { useTickets } from '@/hooks/useTickets';
// import { useUsers } from '@/hooks/useUsers';

// export default function Dashboard() {
//   const { tickets, totalTickets, isLoading: ticketsLoading } = useTickets();
//   const { users, isLoading: usersLoading } = useUsers();
//   const [teamActivity, setTeamActivity] = useState(0);
  
//   useEffect(() => {
//     // Calculate team activity percentage based on ticket responses
//     if (tickets) {
//       const totalResponses = tickets.reduce((acc, ticket) => 
//         acc + (ticket.responses?.length || 0), 0);
//       setTeamActivity(Math.min(Math.round((totalResponses / Math.max(tickets.length, 1)) * 100), 100));
//     }
//   }, [tickets]);
  
//   if (ticketsLoading || usersLoading) {
//     return <div className="loading">Loading dashboard data...</div>;
//   }
  
//   return (
//     <div className="dashboard-container bg-black text-white">
//       <h1 className="text-2xl font-bold mb-6">Team Performance</h1>
      
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         <StatsCard 
//           title="Total members" 
//           value={users?.length || 0} 
//           bgColor="bg-[#00B2CB]" 
//           hasArrow={true} 
//         />
//         <StatsCard 
//           title="Team average activity" 
//           value={`${teamActivity}%`} 
//           bgColor="bg-gray-800" 
//         />
//         <StatsCard 
//           title="Earned this week" 
//           value="$ 9,636" 
//           bgColor="bg-gray-800" 
//           hasArrow={true} 
//         />
//       </div>
      
//       {/* Time tracking section */}
//       <div className="bg-gray-900 p-4 rounded-lg mb-8">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-lg font-semibold">Average Time Worked</h2>
//           <span className="text-[#00B2CB] bg-[#00B2CB20] px-2 py-1 rounded-full text-sm">+1.2%</span>
//         </div>
//         <div className="text-4xl font-bold mb-4">7:02:51</div>
//         <TicketChart />
//       </div>
      
//       {/* Leads by agent section */}
//       <div className="bg-gray-900 p-4 rounded-lg mb-8">
//         <h2 className="text-lg font-semibold mb-4">Leads by sales</h2>
//         <div className="h-48">
//           {/* Bar chart component showing agent performance */}
//           <TicketChart type="bar" highlightIndex={3} /> {/* Highlight Lia's bar */}
//         </div>
//       </div>
      
//       {/* Team members list */}
//       <div className="bg-gray-900 p-4 rounded-lg">
//         <h2 className="text-lg font-semibold mb-4">List members</h2>
//         <table className="w-full">
//           <thead>
//             <tr className="text-gray-400 text-sm">
//               <th className="text-left pb-2">Name</th>
//               <th className="text-left pb-2">Task Progress</th>
//               <th className="text-left pb-2">E-mail</th>
//               <th className="text-left pb-2">Role</th>
//               <th className="text-left pb-2">Last activity</th>
//               <th className="text-left pb-2">Team</th>
//             </tr>
//           </thead>
//           <tbody>
//             {users?.slice(0, 4).map((user, index) => (
//               <tr key={user.id} className="border-t border-gray-800">
//                 <td className="py-4 flex items-center">
//                   <div className="w-8 h-8 rounded-full bg-red-600 mr-2 flex items-center justify-center">
//                     {user.full_name?.charAt(0)}
//                   </div>
//                   {user.full_name}
//                 </td>
//                 <td>
//                   <div className="flex items-center">
//                     <div className="bg-gray-800 h-2 w-24 rounded-full overflow-hidden">
//                       <div 
//                         className="bg-[#00A36C] h-full rounded-full" 
//                         style={{width: `${Math.random() * 100}%`}}
//                       ></div>
//                     </div>
//                     <span className="ml-2 text-sm">{Math.floor(Math.random() * 20)}/{Math.floor(Math.random() * 10) + 20}</span>
//                   </div>
//                 </td>
//                 <td>{user.email}</td>
//                 <td>{user.role}</td>
//                 <td>{new Date(user.last_login || Date.now()).toLocaleDateString()}</td>
//                 <td>
//                   <div className="flex space-x-1">
//                     {user.department === 'Design' && (
//                       <span className="px-2 py-1 text-xs rounded-full bg-red-600 text-white">Design</span>
//                     )}
//                     {user.department === 'Development' && (
//                       <span className="px-2 py-1 text-xs rounded-full bg-yellow-500 text-black">Dev</span>
//                     )}
//                     {user.department === 'Sales' && (
//                       <span className="px-2 py-1 text-xs rounded-full bg-cyan-500 text-white">Sales</span>
//                     )}
//                     {user.department === 'HR' && (
//                       <span className="px-2 py-1 text-xs rounded-full bg-green-600 text-white">HR</span>
//                     )}
//                     <span className="px-2 py-1 text-xs rounded-full bg-yellow-600 text-white">Operations</span>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

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
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B2CB]"></div>
      </div>
    );
  }
  
  return (
    <div className="dashboard-container bg-gray-950 text-white p-6 rounded-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-4 sm:mb-0">Team Performance</h1>
        
        <div className="w-full sm:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="bg-gray-800 text-white w-full sm:w-64 py-2 pl-10 pr-4 rounded-lg border border-gray-700 focus:outline-none focus:border-[#00B2CB] focus:ring-1 focus:ring-[#00B2CB]"
            />
            <svg 
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
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
      <div className="bg-gray-900 p-6 rounded-xl mb-8 shadow-lg border border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Average Time Worked</h2>
          <span className="text-[#00B2CB] bg-[#00B2CB20] px-3 py-1 rounded-full text-sm font-medium">+1.2%</span>
        </div>
        <div className="text-4xl font-bold mb-6">7:02:51</div>
        <TicketChart />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Leads by agent section */}
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-800">
          <h2 className="text-xl font-semibold mb-6">Leads by Sales</h2>
          <div className="h-60">
            <TicketChart type="bar" highlightIndex={3} />
          </div>
        </div>
        
        {/* Team activity section */}
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-800">
          <h2 className="text-xl font-semibold mb-6">Team Activity</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span>Active Tickets</span>
                <span className="text-[#00B2CB]">78%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2.5">
                <div className="bg-[#00B2CB] h-2.5 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span>Response Rate</span>
                <span className="text-green-500">92%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2.5">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span>SLA Compliance</span>
                <span className="text-yellow-500">65%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2.5">
                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Team members list */}
      <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Team Members</h2>
          <button className="bg-[#00B2CB] hover:bg-[#00a0b7] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            View All
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-gray-400 text-sm border-b border-gray-800">
                <th className="text-left py-3 px-4 font-medium">Name</th>
                <th className="text-left py-3 px-4 font-medium">Progress</th>
                <th className="text-left py-3 px-4 font-medium">Email</th>
                <th className="text-left py-3 px-4 font-medium">Role</th>
                <th className="text-left py-3 px-4 font-medium">Last Activity</th>
                <th className="text-left py-3 px-4 font-medium">Team</th>
              </tr>
            </thead>
            <tbody>
              {users?.slice(0, 4).map((user, index) => (
                <tr 
                  key={user.id} 
                  className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-red-600 mr-3 flex items-center justify-center font-semibold">
                        {user.full_name?.charAt(0)}
                      </div>
                      <span>{user.full_name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div className="bg-gray-800 h-2 w-24 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#00A36C] h-full rounded-full" 
                          style={{width: `${Math.random() * 100}%`}}
                        ></div>
                      </div>
                      <span className="ml-3 text-sm">{Math.floor(Math.random() * 20)}/{Math.floor(Math.random() * 10) + 20}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-300">{user.email}</td>
                  <td className="py-4 px-4 text-sm text-gray-300">{user.role}</td>
                  <td className="py-4 px-4 text-sm text-gray-300">
                    {new Date(user.last_login || Date.now()).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
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
    </div>
  );
}