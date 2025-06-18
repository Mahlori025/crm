// src/components/layout/Layout.tsx
'use client';

import { ReactNode } from 'react';
import Header from './Header';
import DevNavigation from '../dev/DevNavigation';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="page-content">
      <Header />
      <main className="main-container">
        {children}
      </main>
      {process.env.NODE_ENV === 'development' && <DevNavigation />}
    </div>
  );
}