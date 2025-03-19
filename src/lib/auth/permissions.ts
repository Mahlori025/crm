// src/lib/auth/permissions.ts
import { Role } from '@/types/user';

export enum Permission {
  // Ticket permissions
  CREATE_TICKET = 'CREATE_TICKET',
  VIEW_ALL_TICKETS = 'VIEW_ALL_TICKETS',
  VIEW_ASSIGNED_TICKETS = 'VIEW_ASSIGNED_TICKETS',
  VIEW_OWN_TICKETS = 'VIEW_OWN_TICKETS',
  UPDATE_ANY_TICKET = 'UPDATE_ANY_TICKET',
  UPDATE_ASSIGNED_TICKET = 'UPDATE_ASSIGNED_TICKET',
  DELETE_TICKET = 'DELETE_TICKET',
  ASSIGN_TICKET = 'ASSIGN_TICKET',
  
  // User permissions
  CREATE_USER = 'CREATE_USER',
  VIEW_USERS = 'VIEW_USERS',
  UPDATE_USER = 'UPDATE_USER',
  DELETE_USER = 'DELETE_USER',
  
  // Report permissions
  VIEW_REPORTS = 'VIEW_REPORTS',
  GENERATE_REPORT = 'GENERATE_REPORT',
  
  // Settings permissions
  MANAGE_SETTINGS = 'MANAGE_SETTINGS'
}

// Role-based permission map
export const rolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: Object.values(Permission),
  [Role.MANAGER]: [
    Permission.CREATE_TICKET,
    Permission.VIEW_ALL_TICKETS,
    Permission.UPDATE_ANY_TICKET,
    Permission.ASSIGN_TICKET,
    Permission.CREATE_USER,
    Permission.VIEW_USERS,
    Permission.UPDATE_USER,
    Permission.VIEW_REPORTS,
    Permission.GENERATE_REPORT
  ],
  [Role.AGENT]: [
    Permission.CREATE_TICKET,
    Permission.VIEW_ASSIGNED_TICKETS,
    Permission.VIEW_OWN_TICKETS,
    Permission.UPDATE_ASSIGNED_TICKET
  ],
  [Role.CUSTOMER]: [
    Permission.CREATE_TICKET,
    Permission.VIEW_OWN_TICKETS
  ]
};

// Check if a user has a specific permission
export function hasPermission(
  userRole: Role,
  permission: Permission
): boolean {
  return rolePermissions[userRole]?.includes(permission) || false;
}