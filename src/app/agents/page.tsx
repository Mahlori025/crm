// src/app/agents/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AgentStats {
  id: string;
  name: string;
  active_tickets: number;
  resolved_this_week: number;
  resolved_this_month: number;
  avg_resolution_hours: number;
  avg_response_hours: number;
  sla_breaches: number;
  satisfied_customers: number;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentStats[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchAgentStats();
  }, []);
  
  const fetchAgentStats = async () => {
    try {
      const response = await fetch('/api/agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
      }
    } catch (error) {
      console.error('Error fetching agent statistics:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="tickets-container">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-2 text-gray-500">Loading agent statistics...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="tickets-container">
      <h1 className="text-2xl font-bold mb-6">Agent Performance</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Agent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Active Tickets
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resolved (Week/Month)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Response Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Resolution Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SLA Breaches
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Satisfaction
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {agents.map((agent) => (
              <tr key={agent.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{agent.active_tickets}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {agent.resolved_this_week} / {agent.resolved_this_month}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {agent.avg_response_hours ? `${agent.avg_response_hours}h` : 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {agent.avg_resolution_hours ? `${agent.avg_resolution_hours}h` : 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm ${agent.sla_breaches > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {agent.sla_breaches}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {agent.satisfied_customers > 0 ? `${Math.round((agent.satisfied_customers / (agent.resolved_this_month || 1)) * 100)}%` : 'N/A'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}