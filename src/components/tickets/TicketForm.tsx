// src/components/tickets/TicketForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TicketPriority, TicketStatus } from '@/types/ticket';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

interface TicketFormProps {
  initialData?: {
    title?: string;
    description?: string;
    priority?: TicketPriority;
    category?: string;
    due_date?: string;
    status?: TicketStatus;
  };
  mode?: 'create' | 'edit';
  ticketId?: string;
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

const CATEGORIES = [
  { value: 'Technical Support', label: 'Technical Support' },
  { value: 'Billing', label: 'Billing' },
  { value: 'Account Management', label: 'Account Management' },
  { value: 'Feature Request', label: 'Feature Request' },
  { value: 'General Inquiry', label: 'General Inquiry' },
];

const PRIORITY_OPTIONS = [
  { value: TicketPriority.LOW, label: 'Low' },
  { value: TicketPriority.MEDIUM, label: 'Medium' },
  { value: TicketPriority.HIGH, label: 'High' },
  { value: TicketPriority.CRITICAL, label: 'Critical' },
];

const STATUS_OPTIONS = [
  { value: TicketStatus.OPEN, label: 'Open' },
  { value: TicketStatus.ASSIGNED, label: 'Assigned' },
  { value: TicketStatus.IN_PROGRESS, label: 'In Progress' },
  { value: TicketStatus.WAITING, label: 'Waiting' },
  { value: TicketStatus.RESOLVED, label: 'Resolved' },
  { value: TicketStatus.CLOSED, label: 'Closed' },
];

export default function TicketForm({
  initialData,
  mode = 'create',
  ticketId,
  onSubmit,
  onCancel,
}: TicketFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    priority: initialData?.priority || TicketPriority.MEDIUM,
    due_date: initialData?.due_date || '',
    status: initialData?.status || TicketStatus.OPEN,
  });

  const [attachments, setAttachments] = useState<File[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.due_date) {
      const dueDate = new Date(formData.due_date);
      const now = new Date();
      if (dueDate < now) {
        newErrors.due_date = 'Due date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const url = mode === 'create' ? '/api/tickets' : `/api/tickets/${ticketId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${mode} ticket`);
      }

      const ticket = await response.json();

      // Handle file attachments if any
      if (attachments.length > 0) {
        const formData = new FormData();
        attachments.forEach(file => {
          formData.append('attachments', file);
        });
        
        await fetch(`/api/tickets/${ticket.id}/attachments`, {
          method: 'POST',
          body: formData,
        });
      }

      if (onSubmit) {
        onSubmit(ticket);
      } else {
        router.push(`/tickets/${ticket.id}`);
      }
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} ticket:`, error);
      setErrors({
        general: error instanceof Error ? error.message : 'An error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {errors.general}
          </div>
        )}

        {/* Title */}
        <Input
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          placeholder="Brief description of the issue"
          required
          fullWidth
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Detailed explanation of the issue..."
            required
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Category and Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={[{ value: '', label: 'Select a category' }, ...CATEGORIES]}
            error={errors.category}
            required
            fullWidth
          />

          <Select
            label="Priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={PRIORITY_OPTIONS}
            required
            fullWidth
          />
        </div>

        {/* Status (only show in edit mode) */}
        {mode === 'edit' && (
          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={STATUS_OPTIONS}
            fullWidth
          />
        )}

        {/* Due Date */}
        <Input
          label="Due Date (optional)"
          name="due_date"
          type="datetime-local"
          value={formData.due_date}
          onChange={handleChange}
          error={errors.due_date}
          fullWidth
        />

        {/* File Attachments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Attachments (optional)
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            You can upload multiple files (PDF, DOC, images). Max 10MB per file.
          </p>
          {attachments.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">Selected files:</p>
              <ul className="text-sm text-gray-500">
                {attachments.map((file, index) => (
                  <li key={index}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading 
              ? (mode === 'create' ? 'Creating...' : 'Updating...') 
              : (mode === 'create' ? 'Create Ticket' : 'Update Ticket')
            }
          </Button>
        </div>
      </form>
    </div>
  );
}