// src/app/api/reports/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { reportingService } from '@/lib/services/reportingService';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!session && !isDevelopment) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type');
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('endDate') || new Date().toISOString();

    const filters = { startDate, endDate };

    let reportData;

    switch (reportType) {
      case 'comprehensive':
        reportData = await reportingService.generateComprehensiveReport(filters);
        break;
      case 'volume':
        reportData = await reportingService.getTicketVolumeOverTime(filters);
        break;
      case 'agents':
        reportData = await reportingService.getAgentPerformanceMetrics(filters);
        break;
      case 'sla':
        reportData = await reportingService.getSLAPerformanceReport(filters);
        break;
      case 'categories':
        reportData = await reportingService.getCategoryDistribution(filters);
        break;
      case 'satisfaction':
        reportData = await reportingService.getSatisfactionTrends(filters);
        break;
      case 'status':
        reportData = await reportingService.getStatusDistribution(filters);
        break;
      case 'response-time':
        reportData = await reportingService.getResponseTimeDistribution(filters);
        break;
      case 'executive':
        reportData = await reportingService.getExecutiveSummary(filters);
        break;
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}