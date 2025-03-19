// src/app/layout.tsx
import { Inter } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
//import { getServerSession } from 'next-auth/next';
//import { authOptions } from '@/lib/auth/authOptions';
import { Metadata } from 'next';
import DevNavigation from '@/components/dev/DevNavigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gibela Portal',
  description: 'Customer relations management system',
  icons: {
    icon: '/images/logo.png', // This sets the favicon
    apple: '/images/logo.png',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="page-content">
          <QueryProvider>
            {children}
            <DevNavigation /> {/* developer navigation component */}
          </QueryProvider>
        </div>
      </body>
    </html>
  );
}