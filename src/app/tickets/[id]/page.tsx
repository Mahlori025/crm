// src/app/tickets/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { Ticket, TicketStatus, TicketPriority, Comment } from '@/types/ticket';
import { Agent } from '@/lib/db/services/assignmentService';

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    status: '',
    priority: '',
    assignee_id: '',
  });
  
  // Assignment related state
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assignmentHistory, setAssignmentHistory] = useState<any[]>([]);
  const [showAssignmentHistory, setShowAssignmentHistory] = useState(false);
  
  useEffect(() => {
    fetchTicket();
    fetchAgents();
    fetchAssignmentHistory();
  }, [ticketId]);
  
  const fetchTicket = async () => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`);
      if (response.ok) {
        const data = await response.json();
        setTicket(data);
        setEditData({
          status: data.status,
          priority: data.priority,
          assignee_id: data.assignee_id || '',
        });
      } else {
        router.push('/tickets');
      }
    } catch (error) {
      console.error('Error fetching ticket:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAgents = async () => {
    setLoadingAgents(true);
    try {
      const response = await fetch(`/api/tickets/assign/agents?ticketId=${ticketId}`);
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoadingAgents(false);
    }
  };
  
  const fetchAssignmentHistory = async () => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/assignment-history`);
      if (response.ok) {
        const data = await response.json();
        setAssignmentHistory(data);
      }
    } catch (error) {
      console.error('Error fetching assignment history:', error);
    }
  };
  
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setCommenting(true);
    try {
      const response = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          is_internal: isInternal,
        }),
      });
      
      if (response.ok) {
        setNewComment('');
        setIsInternal(false);
        fetchTicket();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setCommenting(false);
    }
  };
  
  const handleUpdateTicket = async () => {
    setUpdating(true);
    try {
      const updates: any = {};
      
      if (editData.status !== ticket?.status) {
        updates.status = editData.status;
      }
      
      if (editData.priority !== ticket?.priority) {
        updates.priority = editData.priority;
      }
      
      if (Object.keys(updates).length === 0) {
        setEditMode(false);
        return;
      }
      
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        setEditMode(false);
        fetchTicket();
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
    } finally {
      setUpdating(false);
    }
  };
  
  // Assignment functions
  const handleAssign = async (agentId: string) => {
    setAssigning(true);
    try {
      const response = await fetch('/api/tickets/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, agentId }),
      });
      
      if (response.ok) {
        fetchTicket();
        fetchAssignmentHistory();
        alert('Ticket assigned successfully');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to assign ticket');
      }
    } catch (error) {
      console.error('Error assigning ticket:', error);
      alert('Failed to assign ticket');
    } finally {
      setAssigning(false);
    }
  };
  
  const handleAutoAssign = async () => {
    setAssigning(true);
    try {
      const response = await fetch('/api/tickets/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, autoAssign: true }),
      });
      
      if (response.ok) {
        fetchTicket();
        fetchAssignmentHistory();
        alert('Ticket auto-assigned successfully');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to auto-assign');
      }
    } catch (error) {
      console.error('Error auto-assigning ticket:', error);
      alert('Failed to auto-assign ticket');
    } finally {
      setAssigning(false);
    }
  };
  
  const handleUnassign = async () => {
    if (!confirm('Are you sure you want to unassign this ticket?')) {
      return;
    }
    
    setAssigning(true);
    try {
      const response = await fetch(`/api/tickets/assign?ticketId=${ticketId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchTicket();
        fetchAssignmentHistory();
        setEditData(prev => ({ ...prev, assignee_id: '' }));
        alert('Ticket unassigned successfully');
      }
    } catch (error) {
      console.error('Error unassigning ticket:', error);
      alert('Failed to unassign ticket');
    } finally {
      setAssigning(false);
    }
  };
  
  const getStatusColor = (status: TicketStatus) => {
    const colors = {
      [TicketStatus.OPEN]: 'bg-blue-100 text-blue-800',
      [TicketStatus.ASSIGNED]: 'bg-purple-100 text-purple-800',
      [TicketStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
      [TicketStatus.WAITING]: 'bg-orange-100 text-orange-800',
      [TicketStatus.RESOLVED]: 'bg-green-100 text-green-800',
      [TicketStatus.CLOSED]: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100';
  };
  
  const getPriorityColor = (priority: TicketPriority) => {
    const colors = {
      [TicketPriority.LOW]: 'bg-gray-100 text-gray-800',
      [TicketPriority.MEDIUM]: 'bg-blue-100 text-blue-800',
      [TicketPriority.HIGH]: 'bg-orange-100 text-orange-800',
      [TicketPriority.CRITICAL]: 'bg-red-100 text-red-800',
    };
    return colors[priority] || 'bg-gray-100';
  };
  
  if (loading) {
    return (
      <div className="tickets-container">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-2 text-gray-500">Loading ticket...</p>
        </div>
      </div>
    );
  }
  
  if (!ticket) {
    return <div className="tickets-container">Ticket not found</div>;
  }
  
  return (
    <div className="tickets-container">
      {/* Header */}
      <div className="mb-6">
        <Link href="/tickets" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
          ← Back to tickets
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Ticket #{ticket.ticket_number}</h1>
            <h2 className="text-xl text-gray-700 mt-1">{ticket.title}</h2>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            {editMode ? 'Cancel' : 'Edit'}
          </button>
        </div>
      </div>
      
      {/* Ticket Details */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Status</h3>
            {editMode ? (
              <select
                value={editData.status}
                onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full border-gray-300 rounded-md"
              >
                {Object.values(TicketStatus).map(status => (
                  <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                ))}
              </select>
            ) : (
              <span className={`inline-flex px-3 py-1 rounded-full text-sm ${getStatusColor(ticket.status)}`}>
                {ticket.status.replace(/_/g, ' ')}
              </span>
            )}
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Priority</h3>
            {editMode ? (
              <select
                value={editData.priority}
                onChange={(e) => setEditData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full border-gray-300 rounded-md"
              >
                {Object.values(TicketPriority).map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            ) : (
              <span className={`inline-flex px-3 py-1 rounded-full text-sm ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority}
              </span>
            )}
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700">Category</h3>
            <p>{ticket.category}</p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Assigned To</h3>
            {editMode ? (
              <div className="space-y-2">
                <select
                  value={editData.assignee_id}
                  onChange={(e) => {
                    const newAgentId = e.target.value;
                    setEditData(prev => ({ ...prev, assignee_id: newAgentId }));
                    if (newAgentId && newAgentId !== ticket.assignee_id) {
                      handleAssign(newAgentId);
                    } else if (!newAgentId && ticket.assignee_id) {
                      handleUnassign();
                    }
                  }}
                  disabled={assigning || loadingAgents}
                  className="w-full border-gray-300 rounded-md"
                >
                  <option value="">Unassigned</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} ({agent.active_tickets}/{agent.max_tickets} tickets)
                      {agent.match_score && agent.match_score > 0 && ` - Match: ${agent.match_score}`}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleAutoAssign}
                    disabled={assigning || ticket.assignee_id !== null}
                    className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                  >
                    Auto-assign
                  </button>
                  <button
                    onClick={() => setShowAssignmentHistory(!showAssignmentHistory)}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    {showAssignmentHistory ? 'Hide' : 'Show'} History
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p>{ticket.assignee_name || 'Unassigned'}</p>
                {assignmentHistory.length > 0 && (
                  <button
                    onClick={() => setShowAssignmentHistory(!showAssignmentHistory)}
                    className="text-sm text-gray-600 hover:text-gray-800 mt-1"
                  >
                    {showAssignmentHistory ? 'Hide' : 'Show'} History
                  </button>
                )}
              </div>
            )}
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700">Created By</h3>
            <p>{ticket.created_by_name}</p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700">Created</h3>
            <p>{format(new Date(ticket.created_at), 'PPpp')}</p>
          </div>
          
          {ticket.due_date && (
            <div>
              <h3 className="font-medium text-gray-700">Due Date</h3>
              <p>{format(new Date(ticket.due_date), 'PPp')}</p>
            </div>
          )}
          
          {ticket.sla_response_due && (
            <div>
              <h3 className="font-medium text-gray-700">SLA Response Due</h3>
              <p className={ticket.sla_breached ? 'text-red-600' : ''}>
                {format(new Date(ticket.sla_response_due), 'PPp')}
                {ticket.sla_breached && ' (Breached)'}
              </p>
            </div>
          )}
          
          {ticket.sla_resolution_due && (
            <div>
              <h3 className="font-medium text-gray-700">SLA Resolution Due</h3>
              <p className={ticket.sla_breached ? 'text-red-600' : ''}>
                {format(new Date(ticket.sla_resolution_due), 'PPp')}
              </p>
            </div>
          )}
        </div>
        
        {editMode && (
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setEditMode(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateTicket}
              disabled={updating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {updating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
      
      {/* Assignment History */}
      {showAssignmentHistory && assignmentHistory.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="font-medium text-lg mb-3">Assignment History</h3>
          <div className="space-y-2">
            {assignmentHistory.map((history) => (
              <div key={history.id} className="text-sm border-l-2 border-gray-200 pl-4 py-2">
                <div className="flex justify-between">
                  <span>
                    {history.details.assignee_id ? (
                      <>Assigned to <strong>{history.assigned_to_name || 'Unknown'}</strong></>
                    ) : (
                      <>Unassigned from <strong>{history.details.previous_assignee_name || 'Unknown'}</strong></>
                    )}
                    {' by '}
                    <strong>{history.assigned_by_name || 'System'}</strong>
                  </span>
                  <span className="text-gray-500">
                    {formatDistanceToNow(new Date(history.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Description */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="font-medium text-lg mb-3">Description</h3>
        <p className="whitespace-pre-wrap">{ticket.description}</p>
      </div>
      
      {/* Resolution (if resolved) */}
      {ticket.resolution && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="font-medium text-lg mb-3">Resolution</h3>
          <p className="whitespace-pre-wrap">{ticket.resolution}</p>
        </div>
      )}
      
      {/* Comments */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-medium text-lg mb-4">Comments</h3>
        
        {/* Comment Form */}
        <form onSubmit={handleAddComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
          <div className="mt-2 flex justify-between items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">Internal note (not visible to customers)</span>
            </label>
            <button
              type="submit"
              disabled={commenting || !newComment.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {commenting ? 'Adding...' : 'Add Comment'}
            </button>
          </div>
        </form>
        
        {/* Comments List */}
        <div className="space-y-4">
          {ticket.comments && ticket.comments.length > 0 ? (
            ticket.comments.map((comment) => (
              <div 
                key={comment.id} 
                className={`p-4 rounded-lg ${comment.is_internal ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium">{comment.user_name}</span>
                    {comment.is_internal && (
                      <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                        Internal
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No comments yet</p>
          )}
        </div>
      </div>
    </div>
  );
}