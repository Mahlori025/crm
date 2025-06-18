// src/components/layout/MainLayout.tsx (new file)
'use client';

import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import Header from './Header';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const AUTH_ROUTES = ['/auth/signin', '/auth/signup', '/'];
const FULL_WIDTH_ROUTES = ['/auth/signin', '/auth/signup', '/'];

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  
  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isFullWidth = FULL_WIDTH_ROUTES.includes(pathname);

  if (isAuthRoute) {
    return (
      <SessionProvider>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </SessionProvider>
    );
  }

  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 overflow-hidden">
            <div className="page-content">
              <div className="main-container">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}