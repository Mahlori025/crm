// src/app/api/tickets/[id]/comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { ticketService } from '@/lib/db/services/ticketService';
import { createCommentSchema } from '@/types/ticket';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const comments = await ticketService.getTicketComments(params.id);
    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const isDevelopment = process.env.NODE_ENV === 'development';
    const userId = session?.user.id || (isDevelopment ? 'dev-user-id' : null);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    const validationResult = createCommentSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid comment data', 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }
    
    const comment = await ticketService.addComment(
      params.id,
      userId,
      validationResult.data.content,
      validationResult.data.is_internal
    );
    
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}