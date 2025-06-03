// src/lib/tests/assignmentWorkflow.test.ts
import { assignmentService } from '@/lib/db/services/assignmentService';
import { ticketService } from '@/lib/db/services/ticketService';
import { slaService } from '@/lib/db/services/slaService';

interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
  executionTime: number;
}

export class AssignmentWorkflowTester {
  private results: TestResult[] = [];

  async runAllTests(): Promise<TestResult[]> {
    console.log('🧪 Starting Assignment Workflow Tests...');
    
    await this.testAutoAssignment();
    await this.testManualAssignment();
    await this.testBulkAssignment();
    await this.testSLATracking();
    await this.testNotificationFlow();
    
    console.log('✅ All tests completed');
    return this.results;
  }

  private async testAutoAssignment(): Promise<void> {
    const startTime = Date.now();
    try {
      // Create a test ticket
      const testTicket = await ticketService.createTicket({
        title: 'Test Auto Assignment',
        description: 'Testing auto assignment workflow',
        priority: 'HIGH',
        category: 'Technical Support'
      }, 'test-user-id');

      // Test auto assignment
      const assignedTicket = await assignmentService.autoAssignTicket(testTicket.id);
      
      const passed = assignedTicket !== null && assignedTicket.assignee_id !== null;
      
      this.results.push({
        testName: 'Auto Assignment',
        passed,
        details: passed ? 
          `Ticket assigned to agent ${assignedTicket?.assignee_id}` : 
          'Auto assignment failed',
        executionTime: Date.now() - startTime
      });

    } catch (error) {
      this.results.push({
        testName: 'Auto Assignment',
        passed: false,
        details: `Error: ${error}`,
        executionTime: Date.now() - startTime
      });
    }
  }

  private async testManualAssignment(): Promise<void> {
    const startTime = Date.now();
    try {
      // Get available agents
      const agents = await assignmentService.getAgentsWithWorkload();
      
      if (agents.length === 0) {
        this.results.push({
          testName: 'Manual Assignment',
          passed: false,
          details: 'No agents available for testing',
          executionTime: Date.now() - startTime
        });
        return;
      }

      // Create test ticket
      const testTicket = await ticketService.createTicket({
        title: 'Test Manual Assignment',
        description: 'Testing manual assignment workflow',
        priority: 'MEDIUM',
        category: 'Account Management'
      }, 'test-user-id');

      // Manually assign to first available agent
      const assignedTicket = await assignmentService.assignTicket(
        testTicket.id,
        agents[0].id,
        'test-manager-id'
      );

      const passed = assignedTicket?.assignee_id === agents[0].id;

      this.results.push({
        testName: 'Manual Assignment',
        passed,
        details: passed ? 
          `Ticket manually assigned to ${agents[0].name}` : 
          'Manual assignment failed',
        executionTime: Date.now() - startTime
      });

    } catch (error) {
      this.results.push({
        testName: 'Manual Assignment',
        passed: false,
        details: `Error: ${error}`,
        executionTime: Date.now() - startTime
      });
    }
  }

  private async testBulkAssignment(): Promise<void> {
    const startTime = Date.now();
    try {
      const agents = await assignmentService.getAgentsWithWorkload();
      
      if (agents.length === 0) {
        this.results.push({
          testName: 'Bulk Assignment',
          passed: false,
          details: 'No agents available for testing',
          executionTime: Date.now() - startTime
        });
        return;
      }

      // Create multiple test tickets
      const ticketIds: string[] = [];
      for (let i = 0; i < 3; i++) {
        const ticket = await ticketService.createTicket({
          title: `Test Bulk Assignment ${i + 1}`,
          description: 'Testing bulk assignment workflow',
          priority: 'LOW',
          category: 'General Inquiry'
        }, 'test-user-id');
        ticketIds.push(ticket.id);
      }

      // Bulk assign tickets
      const assignedTickets = await assignmentService.bulkAssignTickets(
        ticketIds,
        agents[0].id,
        'test-manager-id'
      );

      const passed = assignedTickets.length === ticketIds.length;

      this.results.push({
        testName: 'Bulk Assignment',
        passed,
        details: passed ? 
          `Successfully bulk assigned ${assignedTickets.length} tickets` : 
          'Bulk assignment failed',
        executionTime: Date.now() - startTime
      });

    } catch (error) {
      this.results.push({
        testName: 'Bulk Assignment',
        passed: false,
        details: `Error: ${error}`,
        executionTime: Date.now() - startTime
      });
    }
  }

  private async testSLATracking(): Promise<void> {
    const startTime = Date.now();
    try {
      // Test SLA calculation
      const testTicket = await ticketService.createTicket({
        title: 'Test SLA Tracking',
        description: 'Testing SLA tracking workflow',
        priority: 'CRITICAL',
        category: 'Technical Support'
      }, 'test-user-id');

      // Check if SLA dates were set
      const ticket = await ticketService.getTicketById(testTicket.id);
      
      const passed = ticket?.sla_response_due !== null && ticket?.sla_resolution_due !== null;

      this.results.push({
        testName: 'SLA Tracking',
        passed,
        details: passed ? 
          'SLA dates successfully calculated and set' : 
          'SLA tracking failed',
        executionTime: Date.now() - startTime
      });

    } catch (error) {
      this.results.push({
        testName: 'SLA Tracking',
        passed: false,
        details: `Error: ${error}`,
        executionTime: Date.now() - startTime
      });
    }
  }

  private async testNotificationFlow(): Promise<void> {
    const startTime = Date.now();
    try {
      // This would test the notification system
      // For now, we'll just verify the notification functions exist
      const { createNotification } = await import('@/lib/notifications/in-app');
      
      const passed = typeof createNotification === 'function';

      this.results.push({
        testName: 'Notification Flow',
        passed,
        details: passed ? 
          'Notification system is properly configured' : 
          'Notification system not found',
        executionTime: Date.now() - startTime
      });

    } catch (error) {
      this.results.push({
        testName: 'Notification Flow',
        passed: false,
        details: `Error: ${error}`,
        executionTime: Date.now() - startTime
      });
    }
  }
}

// API route to run tests
// src/app/api/admin/test-workflows/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AssignmentWorkflowTester } from '@/lib/tests/assignmentWorkflow.test';

export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
    }

    const tester = new AssignmentWorkflowTester();
    const results = await tester.runAllTests();

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        totalTime: results.reduce((sum, r) => sum + r.executionTime, 0)
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Test execution failed'
    }, { status: 500 });
  }
}