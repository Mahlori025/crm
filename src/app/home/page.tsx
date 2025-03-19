// src/app/home/page.tsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import Image from 'next/image';

export default async function HomePage() {
  // Check authentication on the server side
  const session = await getServerSession(authOptions);
  
  // If logged in, redirect immediately
  if (session) {
    redirect('/dashboard');
  }

  // If not logged in, show the home page
  return (
    <div className="landing-container">
      <div className="max-w-4xl w-full bg-white bg-opacity-90 p-8 md:p-12 rounded-xl shadow-xl">
        <div className="flex justify-center mb-8">
          <Image 
            src="/images/logo.png" 
            alt="Gibela Logo" 
            width={100} 
            height={100} 
            className="h-20 w-auto"
          />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-8">
          Welcome to the Gibela Portal
        </h1>
        
        <p className="text-lg text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          A comprehensive solution for managing customer support tickets,
          tracking SLAs, and improving team productivity.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-md mx-auto">
          <Link 
            href="/auth/signin" 
            className="px-8 py-3 bg-blue-600 text-white text-center rounded-md font-medium hover:bg-blue-700 transition-colors w-full"
          >
            Sign In
          </Link>
          
          <Link 
            href="/auth/signup" 
            className="px-8 py-3 bg-white text-blue-600 text-center border border-blue-200 rounded-md font-medium hover:bg-blue-50 transition-colors w-full"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}