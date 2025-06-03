// src/components/charts/AgentPerformanceChart.tsx
'use client';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface AgentPerformanceData {
  id: string;
  name: string;
  totalAssigned: number;
  resolvedTickets: number;
  resolutionRate: number;
  avgResponseHours: number;
  avgResolutionHours: number;
  slaBreaches: number;
  avgSatisfaction: number;
}

interface AgentPerformanceChartProps {
  data: AgentPerformanceData[];
  height?: number;
}

export default function AgentPerformanceChart({ data, height = 400 }: AgentPerformanceChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const agentData = data.find(agent => agent.name === label);
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm">Total Assigned: {agentData?.totalAssigned}</p>
          <p className="text-sm">Resolved: {agentData?.resolvedTickets}</p>
          <p className="text-sm">Resolution Rate: {agentData?.resolutionRate}%</p>
          <p className="text-sm">Avg Response: {agentData?.avgResponseHours?.toFixed(1)}h</p>
          <p className="text-sm">Avg Resolution: {agentData?.avgResolutionHours?.toFixed(1)}h</p>
          <p className="text-sm">SLA Breaches: {agentData?.slaBreaches}</p>
          <p className="text-sm">Satisfaction: {agentData?.avgSatisfaction?.toFixed(1)}/5</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            stroke="#666"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis stroke="#666" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="resolvedTickets" 
            fill="#059669" 
            name="Resolved Tickets"
            radius={[2, 2, 0, 0]}
          />
          <Bar 
            dataKey="slaBreaches" 
            fill="#dc2626" 
            name="SLA Breaches"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}