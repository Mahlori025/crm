// src/hooks/useAuth.ts
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth(requireAuth = true) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (requireAuth && status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, requireAuth, router]);

  return {
    user: session?.user,
    session,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
  };
}

export function useRequireAuth() {
  return useAuth(true);
}