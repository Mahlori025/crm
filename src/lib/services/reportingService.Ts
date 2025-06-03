// src/lib/services/reportingService.ts
import { query } from '@/lib/db';
import { reportQueries } from '@/lib/db/queries/reports';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface ReportFilters extends DateRange {
  agentId?: string;
  category?: string;
  priority?: string;
  status?: string;
}

export const reportingService = {
  // Get ticket volume over time
  async getTicketVolumeOverTime(filters: DateRange) {
    const result = await query(
      reportQueries.ticketVolumeOverTime,
      [filters.startDate, filters.endDate]
    );
    
    return result.rows.map(row => ({
      date: row.date,
      total: parseInt(row.total_tickets),
      critical: parseInt(row.critical_tickets),
      high: parseInt(row.high_tickets),
      medium: parseInt(row.medium_tickets),
      low: parseInt(row.low_tickets)
    }));
  },

  // Get agent performance metrics
  async getAgentPerformanceMetrics(filters: DateRange) {
    const result = await query(
      reportQueries.agentPerformanceMetrics,
      [filters.startDate, filters.endDate]
    );
    
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      totalAssigned: parseInt(row.total_assigned) || 0,
      resolvedTickets: parseInt(row.resolved_tickets) || 0,
      slaBreaches: parseInt(row.sla_breaches) || 0,
      avgResponseHours: parseFloat(row.avg_response_hours) || 0,
      avgResolutionHours: parseFloat(row.avg_resolution_hours) || 0,
      avgSatisfaction: parseFloat(row.avg_satisfaction) || 0,
      resolutionRate: row.total_assigned > 0 ? 
        Math.round((parseInt(row.resolved_tickets) / parseInt(row.total_assigned)) * 100) : 0
    }));
  },

  // Get SLA performance report
  async getSLAPerformanceReport(filters: DateRange) {
    const result = await query(
      reportQueries.slaPerformanceReport,
      [filters.startDate, filters.endDate]
    );
    
    return result.rows.map(row => ({
      priority: row.priority,
      totalTickets: parseInt(row.total_tickets),
      slaMet: parseInt(row.sla_met),
      slaBreached: parseInt(row.sla_breached),
      complianceRate: parseFloat(row.sla_compliance_rate),
      avgResponseTime: parseFloat(row.avg_response_time) || 0,
      avgResolutionTime: parseFloat(row.avg_resolution_time) || 0
    }));
  },

  // Get category distribution
  async getCategoryDistribution(filters: DateRange) {
    const result = await query(
      reportQueries.categoryDistribution,
      [filters.startDate, filters.endDate]
    );
    
    return result.rows.map(row => ({
      category: row.category,
      ticketCount: parseInt(row.ticket_count),
      avgResolutionHours: parseFloat(row.avg_resolution_hours) || 0,
      slaBreaches: parseInt(row.sla_breaches) || 0,
      avgSatisfaction: parseFloat(row.avg_satisfaction) || 0
    }));
  },

  // Get customer satisfaction trends
  async getSatisfactionTrends(filters: DateRange) {
    const result = await query(
      reportQueries.satisfactionTrends,
      [filters.startDate, filters.endDate]
    );
    
    return result.rows.map(row => ({
      week: row.week,
      avgSatisfaction: parseFloat(row.avg_satisfaction) || 0,
      totalResolved: parseInt(row.total_resolved),
      satisfiedCount: parseInt(row.satisfied_count),
      satisfactionRate: row.total_resolved > 0 ? 
        Math.round((parseInt(row.satisfied_count) / parseInt(row.total_resolved)) * 100) : 0
    }));
  },

  // Get status distribution
  async getStatusDistribution(filters: DateRange) {
    const result = await query(
      reportQueries.statusDistribution,
      [filters.startDate, filters.endDate]
    );
    
    return result.rows.map(row => ({
      status: row.status,
      count: parseInt(row.count),
      percentage: parseFloat(row.percentage)
    }));
  },

  // Get response time distribution
  async getResponseTimeDistribution(filters: DateRange) {
    const result = await query(
      reportQueries.responseTimeDistribution,
      [filters.startDate, filters.endDate]
    );
    
    return result.rows.map(row => ({
      bucket: row.response_time_bucket,
      count: parseInt(row.ticket_count)
    }));
  },

  // Get executive summary
  async getExecutiveSummary(filters: DateRange) {
    // Calculate previous period (same duration, shifted back)
    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);
    const duration = endDate.getTime() - startDate.getTime();
    const prevEndDate = new Date(startDate.getTime() - 1);
    const prevStartDate = new Date(prevEndDate.getTime() - duration);

    const result = await query(
      reportQueries.executiveSummary,
      [
        filters.startDate, 
        filters.endDate,
        prevStartDate.toISOString(),
        prevEndDate.toISOString()
      ]
    );
    
    const row = result.rows[0];
    if (!row) return null;

    return {
      totalTickets: parseInt(row.total_tickets) || 0,
      resolvedTickets: parseInt(row.resolved_tickets) || 0,
      slaBreachedTickets: parseInt(row.sla_breached_tickets) || 0,
      avgSatisfaction: parseFloat(row.avg_satisfaction) || 0,
      avgResolutionHours: parseFloat(row.avg_resolution_hours) || 0,
      resolutionRate: row.total_tickets > 0 ? 
        Math.round((parseInt(row.resolved_tickets) / parseInt(row.total_tickets)) * 100) : 0,
      slaComplianceRate: row.total_tickets > 0 ? 
        Math.round(((parseInt(row.total_tickets) - parseInt(row.sla_breached_tickets)) / parseInt(row.total_tickets)) * 100) : 0,
      ticketVolumeChange: parseFloat(row.ticket_volume_change) || 0,
      satisfactionChange: parseFloat(row.satisfaction_change) || 0,
      prevTotalTickets: parseInt(row.prev_total_tickets) || 0,
      prevResolvedTickets: parseInt(row.prev_resolved_tickets) || 0,
      prevAvgSatisfaction: parseFloat(row.prev_avg_satisfaction) || 0
    };
  },

  // Generate comprehensive report data
  async generateComprehensiveReport(filters: DateRange) {
    const [
      volumeData,
      agentPerformance,
      slaReport,
      categoryDistribution,
      satisfactionTrends,
      statusDistribution,
      responseTimeDistribution,
      executiveSummary
    ] = await Promise.all([
      this.getTicketVolumeOverTime(filters),
      this.getAgentPerformanceMetrics(filters),
      this.getSLAPerformanceReport(filters),
      this.getCategoryDistribution(filters),
      this.getSatisfactionTrends(filters),
      this.getStatusDistribution(filters),
      this.getResponseTimeDistribution(filters),
      this.getExecutiveSummary(filters)
    ]);

    return {
      volumeData,
      agentPerformance,
      slaReport,
      categoryDistribution,
      satisfactionTrends,
      statusDistribution,
      responseTimeDistribution,
      executiveSummary,
      generatedAt: new Date().toISOString(),
      filters
    };
  }
};