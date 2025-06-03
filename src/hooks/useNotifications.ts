// src/hooks/useNotifications.ts (update existing file)
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  read: boolean;
  ticket_id?: string;
  created_at: string;
}

export function useNotifications() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
      
      // Set up SSE for real-time notifications
      const eventSource = new EventSource('/api/notifications/stream');
      
      eventSource.onmessage = (event) => {
        const notification = JSON.parse(event.data);
        if (notification.type === 'new_notification') {
          setNotifications(prev => [notification.data, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    }
  }, [session]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string | 'all') => {
    try {
      const url = notificationId === 'all' 
        ? '/api/notifications/mark-all-read'
        : `/api/notifications/${notificationId}/read`;
      
      const response = await fetch(url, { method: 'POST' });
      
      if (response.ok) {
        if (notificationId === 'all') {
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
          setUnreadCount(0);
        } else {
          setNotifications(prev => 
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    refetch: fetchNotifications
  };
}