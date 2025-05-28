// src/app/api/agents/[id]/preferences/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { assignmentService } from '@/lib/db/services/assignmentService';

// PUT /api/agents/[id]/preferences - Update agent preferences
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!session && !isDevelopment) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const preferences = await assignmentService.updateAgentPreferences(params.id, body);
    
    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error updating agent preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}