// src/app/layout.tsx
import { Inter } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions'; // Updated import path
import { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CRM Ticket System',
  description: 'Customer support ticket management system',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}