// src/lib/auth/session.ts
import { getServerSession } from 'next-auth';
import { authOptions } from './authOptions';
import { Permission, hasPermission } from './permissions';
import { redirect } from 'next/navigation';

// Get the current session
export async function getSession() {
  return await getServerSession(authOptions);
}

// Check if the user is authenticated
export async function requireAuth() {
  const session = await getSession();
  
  if (!session) {
    redirect('/auth/signin?callbackUrl=/dashboard');
  }
  
  return session;
}

// Check if the user has the required permission
export async function requirePermission(permission: Permission) {
  const session = await requireAuth();
  
  if (!hasPermission(session.user.role, permission)) {
    redirect('/dashboard');
  }
  
  return session;
}