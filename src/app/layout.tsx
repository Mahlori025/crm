// src/app/layout.tsx
import { Inter } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import { Metadata } from 'next';
import DevNavigation from '@/components/dev/DevNavigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gibela Portal',
  description: 'Customer relations management system',
  icons: {
    icon: '/images/logo.png',
    apple: '/images/logo.png',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="page-content">
          <QueryProvider>
            <main className="main-container">
              {children}
            </main>
            <DevNavigation />
          </QueryProvider>
        </div>
      </body>
    </html>
  );
}