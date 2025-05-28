// src/app/api/agents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { assignmentService } from '@/lib/db/services/assignmentService';

// GET /api/agents - Get agent statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!session && !isDevelopment) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const statistics = await assignmentService.getAgentStatistics();
    
    return NextResponse.json(statistics);
  } catch (error) {
    console.error('Error fetching agent statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent statistics' },
      { status: 500 }
    );
  }
}