// src/components/dashboard/TicketChart.tsx
import React from 'react';

type TicketChartProps = {
  type?: 'line' | 'bar';
  highlightIndex?: number;
};

export default function TicketChart({ type = 'line', highlightIndex = -1 }: TicketChartProps) {
  const barData = [
    { name: 'Andy', value: 65 },
    { name: 'Mike', value: 85 },
    { name: 'Alice', value: 75 },
    { name: 'Lia', value: 97 },
    { name: 'Jane', value: 55 },
    { name: 'Paul', value: 65 },
    { name: 'Alex', value: 85 },
    { name: 'Sarah', value: 80 },
    { name: 'Sam', value: 90 },
  ];

  if (type === 'bar') {
    return (
      <div className="relative h-full flex items-end space-x-2">
        {barData.map((item, index) => (
          <div key={item.name} className="flex flex-col items-center flex-1">
            <div 
              className={`w-full ${index === highlightIndex ? 'bg-[#00B2CB]' : 'bg-[#00B2CB]/30'} rounded-t-md`} 
              style={{ height: `${item.value}%` }}
            >
              {index === highlightIndex && (
                <div className="bg-[#00B2CB] text-black text-xs font-bold py-1 px-2 rounded absolute -top-8 left-1/2 transform -translate-x-1/2">
                  {item.value}
                </div>
              )}
            </div>
            <div className="text-xs mt-2 text-gray-400">{item.name}</div>
          </div>
        ))}
      </div>
    );
  }

  // Simple SVG line chart
  return (
    <div className="h-32 w-full">
      <svg width="100%" height="100%" viewBox="0 0 800 200" preserveAspectRatio="none">
        <path 
          d="M0,150 C100,120 200,180 300,100 C400,30 500,90 600,60 C700,40 800,90 800,110" 
          stroke="#00B2CB" 
          strokeWidth="3" 
          fill="none" 
        />
        <path 
          d="M0,150 C100,120 200,180 300,100 C400,30 500,90 600,60 C700,40 800,90 800,110 L800,200 L0,200 Z" 
          fill="url(#gradient)" 
          opacity="0.2" 
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00B2CB" />
            <stop offset="100%" stopColor="#00B2CB" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}