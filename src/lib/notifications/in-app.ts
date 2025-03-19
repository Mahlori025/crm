// src/lib/notifications/in-app.ts
import { db } from '../db';

type NotificationType = 'ticket_assigned' | 'sla_breached' | 'ticket_updated' | 'ticket_comment';

export async function createNotification(
  userId: number,
  type: NotificationType,
  title: string,
  message: string,
  linkUrl: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    await db.query(
      `INSERT INTO notifications (
        user_id, type, title, message, link_url, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, type, title, message, linkUrl, JSON.stringify(metadata)]
    );
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

export async function notifyTicketAssigned(
  userId: number,
  ticketId: number
): Promise<void> {
  // Get ticket details
  const ticketResult = await db.query('SELECT title FROM tickets WHERE id = $1', [ticketId]);
  if (ticketResult.rows.length === 0) return;
  
  const ticketTitle = ticketResult.rows[0].title;
  
  await createNotification(
    userId,
    'ticket_assigned',
    'New Ticket Assigned',
    `You have been assigned ticket #${ticketId}: ${ticketTitle}`,
    `/tickets/${ticketId}`,
    { ticketId }
  );
}

export async function notifySlaBreached(
  userId: number,
  ticketId: number,
  breachType: 'response' | 'resolution'
): Promise<void> {
  // Get ticket details
  const ticketResult = await db.query('SELECT title FROM tickets WHERE id = $1', [ticketId]);
  if (ticketResult.rows.length === 0) return;
  
  const ticketTitle = ticketResult.rows[0].title;
  const breachTypeDisplay = breachType === 'response' ? 'Response Time' : 'Resolution Time';
  
  await createNotification(
    userId,
    'sla_breached',
    `SLA Breach: ${breachTypeDisplay}`,
    `Ticket #${ticketId} (${ticketTitle}) has breached its ${breachTypeDisplay} SLA`,
    `/tickets/${ticketId}`,
    { ticketId, breachType }
  );
}

export async function notifyTicketComment(
  userId: number,
  ticketId: number,
  commenterId: number,
  commenterName: string
): Promise<void> {
  // Get ticket details
  const ticketResult = await db.query('SELECT title FROM tickets WHERE id = $1', [ticketId]);
  if (ticketResult.rows.length === 0) return;
  
  const ticketTitle = ticketResult.rows[0].title;
  
  await createNotification(
    userId,
    'ticket_comment',
    'New Comment on Ticket',
    `${commenterName} commented on ticket #${ticketId}: ${ticketTitle}`,
    `/tickets/${ticketId}#comments`,
    { ticketId, commenterId }
  );
}

export async function markNotificationAsRead(notificationId: number): Promise<void> {
  try {
    await db.query(
      'UPDATE notifications SET read_at = NOW() WHERE id = $1',
      [notificationId]
    );
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

export async function getUserUnreadNotifications(userId: number): Promise<any[]> {
  try {
    const result = await db.query(
      'SELECT * FROM notifications WHERE user_id = $1 AND read_at IS NULL ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting unread notifications:', error);
    return [];
  }
}