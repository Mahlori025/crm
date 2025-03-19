// src/types/user.ts
import { z } from 'zod';

export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  AGENT = 'AGENT',
  CUSTOMER = 'CUSTOMER'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type UserWithPassword = User & {
  password: string;
};

export interface NewUser {
  email: string;
  password: string;
  name: string;
  role?: Role;
  active?: boolean;
}

export interface UserUpdate {
  email?: string;
  name?: string;
  role?: Role;
  active?: boolean;
  password?: string;
}

// Validation schemas
export const newUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.nativeEnum(Role).optional(),
  active: z.boolean().optional()
});

export const userUpdateSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  role: z.nativeEnum(Role).optional(),
  active: z.boolean().optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional()
});

// Type inference from schemas
export type ValidatedNewUser = z.infer<typeof newUserSchema>;
export type ValidatedUserUpdate = z.infer<typeof userUpdateSchema>;