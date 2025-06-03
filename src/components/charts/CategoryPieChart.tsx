// src/components/charts/CategoryPieChart.tsx
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CategoryData {
  category: string;
  ticketCount: number;
  avgResolutionHours: number;
  slaBreaches: number;
  avgSatisfaction: number;
}

interface CategoryPieChartProps {
  data: CategoryData[];
  height?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function CategoryPieChart({ data, height = 300 }: CategoryPieChartProps) {
  const chartData = data.map(item => ({
    name: item.category,
    value: item.ticketCount
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const originalData = data.find((d: CategoryData) => d.category === data.name) || data;
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">Tickets: {data.value}</p>
          {originalData && (
            <>
              <p className="text-sm">Avg Resolution: {originalData.avgResolutionHours?.toFixed(1)}h</p>
              <p className="text-sm">SLA Breaches: {originalData.slaBreaches}</p>
              <p className="text-sm">Satisfaction: {originalData.avgSatisfaction?.toFixed(1)}/5</p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}