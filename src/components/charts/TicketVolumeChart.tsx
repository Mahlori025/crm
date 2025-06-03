// src/components/charts/TicketVolumeChart.tsx
'use client';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { format } from 'date-fns';

interface TicketVolumeData {
  date: string;
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface TicketVolumeChartProps {
  data: TicketVolumeData[];
  height?: number;
}

export default function TicketVolumeChart({ data, height = 300 }: TicketVolumeChartProps) {
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'MMM dd');
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{format(new Date(label), 'MMM dd, yyyy')}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            stroke="#666"
            fontSize={12}
          />
          <YAxis stroke="#666" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="#2563eb" 
            strokeWidth={2}
            name="Total Tickets"
            dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="critical" 
            stroke="#dc2626" 
            strokeWidth={2}
            name="Critical"
            dot={{ fill: '#dc2626', strokeWidth: 2, r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="high" 
            stroke="#ea580c" 
            strokeWidth={2}
            name="High"
            dot={{ fill: '#ea580c', strokeWidth: 2, r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="medium" 
            stroke="#0891b2" 
            strokeWidth={2}
            name="Medium"
            dot={{ fill: '#0891b2', strokeWidth: 2, r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="low" 
            stroke="#059669" 
            strokeWidth={2}
            name="Low"
            dot={{ fill: '#059669', strokeWidth: 2, r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}