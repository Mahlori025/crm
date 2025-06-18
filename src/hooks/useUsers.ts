// src/hooks/useUsers.ts
'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types/user';

interface UseUsersOptions {
  limit?: number;
  offset?: number;
  search?: string;
  role?: string;
  active?: boolean;
}

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  total: number;
  totalPages: number;
  currentPage: number;
  refetch: () => void;
  createUser: (userData: any) => Promise<User>;
  updateUser: (id: string, userData: any) => Promise<User>;
  deleteUser: (id: string) => Promise<boolean>;
}

export function useUsers(options: UseUsersOptions = {}): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      
      if (options.limit) searchParams.append('limit', options.limit.toString());
      if (options.offset) searchParams.append('offset', options.offset.toString());
      if (options.search) searchParams.append('search', options.search);
      if (options.role) searchParams.append('role', options.role);
      if (options.active !== undefined) searchParams.append('active', options.active.toString());

      const response = await fetch(`/api/users?${searchParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
      setCurrentPage(data.currentPage || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: any): Promise<User> => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create user');
    }

    const user = await response.json();
    setUsers(prev => [user, ...prev]);
    setTotal(prev => prev + 1);
    
    return user;
  };

  const updateUser = async (id: string, userData: any): Promise<User> => {
    const response = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update user');
    }

    const user = await response.json();
    setUsers(prev => prev.map(u => u.id === id ? user : u));
    
    return user;
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    const response = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete user');
    }

    setUsers(prev => prev.filter(u => u.id !== id));
    setTotal(prev => prev - 1);
    
    return true;
  };

  useEffect(() => {
    fetchUsers();
  }, [options.limit, options.offset, options.search, options.role, options.active]);

  return {
    users,
    loading,
    error,
    total,
    totalPages,
    currentPage,
    refetch: fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
}

// Convenience hook for getting all active users
export function useActiveUsers() {
  return useUsers({ active: true, limit: 100 });
}

// Convenience hook for getting agents
export function useAgents() {
  return useUsers({ role: 'AGENT', active: true });
}

// Convenience hook for getting users with pagination
export function usePaginatedUsers(page: number = 1, limit: number = 10, search?: string) {
  const offset = (page - 1) * limit;
  return useUsers({ limit, offset, search });
}