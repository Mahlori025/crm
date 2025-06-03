// src/app/api/notifications/stream/route.ts
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const userId = session.user.id;
  
  return new Response(
    new ReadableStream({
      start(controller) {
        // Send initial connection message
        controller.enqueue(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
        
        // Set up keepalive
        const keepaliveInterval = setInterval(() => {
          controller.enqueue(`data: ${JSON.stringify({ type: 'keepalive' })}\n\n`);
        }, 30000);
        
        // Handle abort
        request.signal.addEventListener('abort', () => {
          clearInterval(keepaliveInterval);
        });
      }
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    }
  );
}