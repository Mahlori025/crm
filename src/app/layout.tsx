
// // src/app/layout.tsx (update existing file)
// import { Inter } from 'next/font/google';
// import './globals.css';
// import QueryProvider from '@/providers/QueryProvider';
// import { Metadata } from 'next';
// import DevNavigation from '@/components/dev/DevNavigation';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth/authOptions';
// import MainLayout from '@/components/layout/MainLayout';

// const inter = Inter({ subsets: ['latin'] });

// export const metadata: Metadata = {
//   title: 'Gibela Portal',
//   description: 'Customer relations management system',
//   icons: {
//     icon: '/images/logo.png',
//     apple: '/images/logo.png',
//   },
// };

// // Initialize background jobs on server start
// if (typeof window === 'undefined') {
//   import('@/lib/jobs').then(({ initializeBackgroundJobs }) => {
//     initializeBackgroundJobs();
//   });
// }

// export default async function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         <QueryProvider>
//           <MainLayout>
//             {children}
//           </MainLayout>
//           <DevNavigation />
//         </QueryProvider>
//       </body>
//     </html>
//   );
// }


// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientProvider from '@/components/providers/ClientProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gibela Portal',
  description: 'Ticket Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProvider>
          <div className="app-wrapper">
            {children}
          </div>
        </ClientProvider>
      </body>
    </html>
  );
}