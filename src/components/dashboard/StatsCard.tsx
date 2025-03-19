// src/components/dashboard/StatsCard.tsx
import React from 'react';

type StatsCardProps = {
  title: string;
  value: string | number;
  bgColor?: string;
  hasArrow?: boolean;
};

export default function StatsCard({ title, value, bgColor = 'bg-gray-800', hasArrow = false }: StatsCardProps) {
  return (
    <div className={`${bgColor} rounded-lg p-4 relative`}>
      <h3 className="text-gray-300 text-sm mb-2">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
      {hasArrow && (
        <button className="absolute top-4 right-4 bg-white bg-opacity-10 rounded-full w-8 h-8 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 13L13 1M13 1H5M13 1V9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </div>
  );
}