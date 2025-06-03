// src/lib/jobs/index.ts
import { slaJobScheduler } from './slaChecker';

// Initialize background jobs
export function initializeBackgroundJobs() {
  console.log('🔧 Initializing background jobs...');
  
  // Start SLA monitoring
  slaJobScheduler.startSLAChecker();
  
  // Start auto-assignment
  slaJobScheduler.startAutoAssignmentJob();
  
  console.log('✅ Background jobs initialized');
}

// Graceful shutdown
export function shutdownBackgroundJobs() {
  console.log('🛑 Shutting down background jobs...');
  slaJobScheduler.stopAllJobs();
  console.log('✅ Background jobs stopped');
}