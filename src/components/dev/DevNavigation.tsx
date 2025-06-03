// src/components/dev/DevNavigation.tsx (update existing file)
'use client';

import { useState } from 'react';
import Link from 'next/link';
import TestRunner from './TestRunner';

export default function DevNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTests, setShowTests] = useState(false);

  // Only show in development environment
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <button
          className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          title="Developer Navigation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute bottom-16 right-0 bg-white p-4 rounded-lg shadow-xl border border-gray-200 w-64">
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <h3 className="font-bold text-lg">Dev Navigation</h3>
              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Development Only</span>
            </div>
            
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-gray-500 mb-1">Public Pages</h4>
              <ul className="space-y-1">
                <li>
                  <Link href="/" className="text-blue-600 hover:underline block py-1 px-2 hover:bg-gray-50 rounded">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signin" className="text-blue-600 hover:underline block py-1 px-2 hover:bg-gray-50 rounded">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signup" className="text-blue-600 hover:underline block py-1 px-2 hover:bg-gray-50 rounded">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-gray-500 mb-1">Protected Pages</h4>
              <ul className="space-y-1">
                <li>
                  <Link href="/dashboard" className="text-blue-600 hover:underline block py-1 px-2 hover:bg-gray-50 rounded">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/tickets" className="text-blue-600 hover:underline block py-1 px-2 hover:bg-gray-50 rounded">
                    Tickets List
                  </Link>
                </li>
                <li>
                  <Link href="/tickets/create" className="text-blue-600 hover:underline block py-1 px-2 hover:bg-gray-50 rounded">
                    Create Ticket
                  </Link>
                </li>
                <li>
                  <Link href="/agents/dashboard" className="text-blue-600 hover:underline block py-1 px-2 hover:bg-gray-50 rounded">
                    Agent Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/agents" className="text-blue-600 hover:underline block py-1 px-2 hover:bg-gray-50 rounded">
                    Agent Performance
                  </Link>
                </li>
              </ul>
            </div>

            <div className="border-t pt-2">
              <button
                onClick={() => setShowTests(!showTests)}
                className="w-full text-left py-1 px-2 hover:bg-gray-50 rounded text-purple-600 hover:underline"
              >
                {showTests ? 'Hide Tests' : 'Show Tests'}
              </button>
            </div>
          </div>
        )}
      </div>

      {showTests && <TestRunner />}
    </>
  );
}