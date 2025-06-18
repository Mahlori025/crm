// // src/components/layout/Header.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { useSession, signOut } from 'next-auth/react';
// import Link from 'next/link';
// import Image from 'next/image';
// import { useNotifications } from '@/hooks/useNotifications';

// export default function Header() {
//   const { data: session } = useSession();
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isNotificationOpen, setIsNotificationOpen] = useState(false);
//   const { notifications, unreadCount, markAsRead } = useNotifications();

//   // Close dropdowns when clicking outside
//   useEffect(() => {
//     const handleClickOutside = () => {
//       setIsMenuOpen(false);
//       setIsNotificationOpen(false);
//     };

//     document.addEventListener('click', handleClickOutside);
//     return () => document.removeEventListener('click', handleClickOutside);
//   }, []);

//   return (
//     <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
//       <div className="px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           {/* Logo */}
//           <div className="flex items-center">
//             <Link href="/dashboard" className="flex items-center">
//               <Image
//                 src="/images/logo.png"
//                 alt="Gibela Logo"
//                 width={40}
//                 height={40}
//                 className="h-8 w-auto"
//               />
//               <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">
//                 Gibela Portal
//               </span>
//             </Link>
//           </div>

//           {/* Search Bar */}
//           <div className="flex-1 max-w-lg mx-8 hidden md:block">
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search tickets, users, or content..."
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               />
//               <svg
//                 className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//                 />
//               </svg>
//             </div>
//           </div>

//           {/* Right side - Notifications & User Menu */}
//           <div className="flex items-center space-x-4">
//             {/* Quick Actions */}
//             <Link
//               href="/tickets/create"
//               className="hidden sm:inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//             >
//               <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//               </svg>
//               New Ticket
//             </Link>

//             {/* Notifications */}
//             {session && (
//               <div className="relative" onClick={(e) => e.stopPropagation()}>
//                 <button
//                   onClick={() => setIsNotificationOpen(!isNotificationOpen)}
//                   className="p-2 text-gray-400 hover:text-gray-500 relative"
//                 >
//                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
//                       d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
//                   </svg>
//                   {unreadCount > 0 && (
//                     <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//                       {unreadCount > 9 ? '9+' : unreadCount}
//                     </span>
//                   )}
//                 </button>

//                 {/* Notifications Dropdown */}
//                 {isNotificationOpen && (
//                   <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
//                     <div className="p-4 border-b border-gray-200">
//                       <div className="flex justify-between items-center">
//                         <h3 className="text-lg font-medium">Notifications</h3>
//                         {unreadCount > 0 && (
//                           <button
//                             onClick={() => markAsRead('all')}
//                             className="text-sm text-blue-600 hover:text-blue-800"
//                           >
//                             Mark all read
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                     <div className="max-h-96 overflow-y-auto">
//                       {notifications.length === 0 ? (
//                         <div className="p-4 text-center text-gray-500">
//                           No notifications
//                         </div>
//                       ) : (
//                         notifications.slice(0, 5).map((notification) => (
//                           <div
//                             key={notification.id}
//                             className={`p-4 hover:bg-gray-50 border-b border-gray-100 ${
//                               !notification.read ? 'bg-blue-50' : ''
//                             }`}
//                             onClick={() => {
//                               if (!notification.read) {
//                                 markAsRead(notification.id);
//                               }
//                               if (notification.ticket_id) {
//                                 window.location.href = `/tickets/${notification.ticket_id}`;
//                               }
//                             }}
//                           >
//                             <div className="flex">
//                               <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
//                                 !notification.read ? 'bg-blue-500' : 'bg-gray-300'
//                               }`}></div>
//                               <div className="flex-1">
//                                 <p className="text-sm font-medium text-gray-900">
//                                   {notification.title}
//                                 </p>
//                                 <p className="text-sm text-gray-600 mt-1">
//                                   {notification.content}
//                                 </p>
//                                 <p className="text-xs text-gray-500 mt-1">
//                                   {new Date(notification.created_at).toLocaleDateString()}
//                                 </p>
//                               </div>
//                             </div>
//                           </div>
//                         ))
//                       )}
//                     </div>
//                     {notifications.length > 5 && (
//                       <div className="p-2 border-t border-gray-200">
//                         <Link
//                           href="/notifications"
//                           className="block text-center text-sm text-blue-600 hover:text-blue-800"
//                         >
//                           View all notifications
//                         </Link>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* User Menu */}
//             {session ? (
//               <div className="relative" onClick={(e) => e.stopPropagation()}>
//                 <button
//                   onClick={() => setIsMenuOpen(!isMenuOpen)}
//                   className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
//                     {session.user.name?.charAt(0) || 'U'}
//                   </div>
//                   <span className="ml-2 text-gray-700 hidden sm:block">
//                     {session.user.name}
//                   </span>
//                   <svg className="ml-1 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                   </svg>
//                 </button>

//                 {/* User Dropdown */}
//                 {isMenuOpen && (
//                   <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
//                     <div className="p-4 border-b border-gray-200">
//                       <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
//                       <p className="text-sm text-gray-500">{session.user.email}</p>
//                       <p className="text-xs text-gray-400 mt-1">{session.user.role}</p>
//                     </div>
//                     <div className="py-1">
//                       <Link
//                         href="/profile"
//                         className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                       >
//                         Your Profile
//                       </Link>
//                       <Link
//                         href="/dashboard/settings"
//                         className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                       >
//                         Settings
//                       </Link>
//                       <button
//                         onClick={() => signOut()}
//                         className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                       >
//                         Sign out
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <Link
//                 href="/auth/signin"
//                 className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
//               >
//                 Sign In
//               </Link>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }

// src/components/layout/Header.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img 
                src="/images/logo.png" 
                alt="Gibela" 
                className="h-8 w-auto"
              />
              <span className="ml-2 text-xl font-semibold text-gray-900">
                Gibela Portal
              </span>
            </Link>
            
            <nav className="hidden md:ml-6 md:flex md:space-x-8">
              <Link 
                href="/dashboard" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link 
                href="/tickets" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Tickets
              </Link>
              <Link 
                href="/agents" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Agents
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                    {session.user?.name?.charAt(0) || 'U'}
                  </div>
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                    <button
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}