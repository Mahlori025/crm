// src/lib/jobs/slaChecker.ts
import { slaService } from '@/lib/db/services/slaService';

class SLAJobScheduler {
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  // Check SLA breaches every 5 minutes
  startSLAChecker() {
    if (this.intervals.has('sla-checker')) {
      return; // Already running
    }

    const interval = setInterval(async () => {
      try {
        console.log('🔍 Checking SLA breaches...');
        await slaService.checkSlaBreaches();
        console.log('✅ SLA check completed');
      } catch (error) {
        console.error('❌ SLA check failed:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    this.intervals.set('sla-checker', interval);
    console.log('🚀 SLA checker started - checking every 5 minutes');
  }

  // Auto-assignment job - runs every 2 minutes for unassigned tickets
  startAutoAssignmentJob() {
    if (this.intervals.has('auto-assignment')) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        console.log('🎯 Running auto-assignment job...');
        
        // Get unassigned tickets older than 5 minutes
        const { query } = await import('@/lib/db');
        const unassignedResult = await query(`
          SELECT id FROM tickets 
          WHERE assignee_id IS NULL 
            AND status = 'OPEN'
            AND created_at < NOW() - INTERVAL '5 minutes'
          LIMIT 10
        `);

        if (unassignedResult.rows.length > 0) {
          const { assignmentService } = await import('@/lib/db/services/assignmentService');
          
          for (const ticket of unassignedResult.rows) {
            try {
              await assignmentService.autoAssignTicket(ticket.id);
              console.log(`✅ Auto-assigned ticket ${ticket.id}`);
            } catch (error) {
              console.error(`❌ Failed to auto-assign ticket ${ticket.id}:`, error);
            }
          }
        } else {
          console.log('ℹ️ No unassigned tickets found');
        }
      } catch (error) {
        console.error('❌ Auto-assignment job failed:', error);
      }
    }, 2 * 60 * 1000); // 2 minutes

    this.intervals.set('auto-assignment', interval);
    console.log('🚀 Auto-assignment job started - running every 2 minutes');
  }

  stopJob(jobName: string) {
    const interval = this.intervals.get(jobName);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(jobName);
      console.log(`🛑 Stopped job: ${jobName}`);
    }
  }

  stopAllJobs() {
    for (const [jobName] of this.intervals) {
      this.stopJob(jobName);
    }
  }
}

export const slaJobScheduler = new SLAJobScheduler();

// Auto-start jobs in production
if (process.env.NODE_ENV === 'production') {
  slaJobScheduler.startSLAChecker();
  slaJobScheduler.startAutoAssignmentJob();
}