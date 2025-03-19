// src/components/layout/NotificationBell.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationBell() {
  const router = useRouter();
  const { notifications, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read_at).length;
  
  const handleClick = () => {
    setIsOpen(!isOpen);
  };
  
  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    router.push(notification.link_url);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <button 
        className="relative p-2 rounded-full hover:bg-gray-800 transition-colors"
        onClick={handleClick}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-lg shadow-lg z-10">
          <div className="p-3 border-b border-gray-800 flex justify-between items-center">
            <h3 className="font-medium">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className="text-xs text-red-500 hover:text-red-400"
                onClick={() => markAsRead('all')}
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-800 ${!notification.read_at ? 'bg-gray-800' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start">
                    <div className={`w-2 h-2 mt-1.5 rounded-full ${!notification.read_at ? 'bg-red-600' : 'bg-gray-600'} mr-2`}></div>
                    <div>
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <p className="text-sm text-gray-400">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-2 text-center border-t border-gray-800">
            <button 
              className="text-sm text-gray-400 hover:text-white"
              onClick={() => router.push('/notifications')}
            >
              View all notifications
            </button>
          </div>
        </div>
      )}