// src/lib/notifications/email.ts
import nodemailer from 'nodemailer';
import { Ticket } from '@/types/ticket';

// Create a transporter object
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendAssignmentEmail(
  recipientEmail: string,
  ticket: Ticket
): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"CRM Support" <${process.env.EMAIL_FROM}>`,
      to: recipientEmail,
      subject: `Ticket Assigned: #${ticket.id} - ${ticket.title}`,
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2 style="color: #C00000;">New Ticket Assignment</h2>
          <p>You have been assigned a new support ticket.</p>
          
          <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #C00000; background-color: #f8f8f8;">
            <p><strong>Ticket #${ticket.id}:</strong> ${ticket.title}</p>
            <p><strong>Priority:</strong> ${getPriorityText(ticket.priority)}</p>
            <p><strong>Status:</strong> ${ticket.status.replace('_', ' ')}</p>
            <p><strong>Description:</strong> ${ticket.description}</p>
          </div>
          
          <p>Please respond to this ticket within the required SLA time frame.</p>
          
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/tickets/${ticket.id}" 
             style="display: inline-block; background-color: #C00000; color: white; padding: 10px 15px; 
                    text-decoration: none; border-radius: 4px; margin-top: 15px;">
            View Ticket
          </a>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending assignment email:', error);
  }
}

export async function sendSlaBreachEmail(
  recipientEmail: string,
  ticket: Ticket,
  breachType: 'response' | 'resolution'
): Promise<void> {
  const breachTypeText = breachType === 'response' ? 'Response Time' : 'Resolution Time';
  
  try {
    await transporter.sendMail({
      from: `"CRM Support" <${process.env.EMAIL_FROM}>`,
      to: recipientEmail,
      subject: `URGENT: SLA Breach on Ticket #${ticket.id}`,
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2 style="color: #C00000;">SLA Breach Alert</h2>
          <p>A ticket assigned to you has breached its ${breachTypeText} SLA.</p>
          
          <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #C00000; background-color: #f8f8f8;">
            <p><strong>Ticket #${ticket.id}:</strong> ${ticket.title}</p>
            <p><strong>Priority:</strong> ${getPriorityText(ticket.priority)}</p>
            <p><strong>Status:</strong> ${ticket.status.replace('_', ' ')}</p>
            <p><strong>SLA Breach:</strong> ${breachTypeText}</p>
            ${breachType === 'response' ? 
              `<p><strong>Response Due:</strong> ${formatDate(ticket.sla_response_due)}</p>` : 
              `<p><strong>Resolution Due:</strong> ${formatDate(ticket.sla_resolution_due)}</p>`
            }
          </div>
          
          <p>Please take immediate action to address this ticket.</p>
          
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/tickets/${ticket.id}" 
             style="display: inline-block; background-color: #C00000; color: white; padding: 10px 15px; 
                    text-decoration: none; border-radius: 4px; margin-top: 15px;">
            View Ticket
          </a>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending SLA breach email:', error);
  }
}

// Helper function to format date
function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleString();
}

// Helper function to convert priority number to text
function getPriorityText(priority: number): string {
  switch (priority) {
    case 1: return 'Low';
    case 2: return 'Medium';
    case 3: return 'High';
    case 4: return 'Critical';
    default: return 'Unknown';
  }
}