// src/app/home/page.tsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';

export default async function HomePage() {
  // Check authentication on the server side
  const session = await getServerSession(authOptions);
  
  // If logged in, redirect immediately
  if (session) {
    redirect('/dashboard');
  }

  // If not logged in, show the home page
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Welcome to the CRM Ticket System
        </h1>
        
        <p className="text-lg text-gray-600 mb-10">
          A comprehensive solution for managing customer support tickets,
          tracking SLAs, and improving team productivity.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/auth/signin" 
            className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
          
          <Link 
            href="/auth/signup" 
            className="px-6 py-3 bg-white text-blue-600 border border-blue-200 rounded-md font-medium hover:bg-blue-50 transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}