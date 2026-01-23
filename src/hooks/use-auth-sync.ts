/**
 * Auth Sync Hook
 * 
 * Fetches current user from backend and syncs with Zustand store.
 * Should only be called in protected layouts, not globally.
 * 
 * How it works:
 * 1. Fetch user data (if httpOnly cookies exist, backend returns user)
 * 2. Update Zustand store with user data
 * 3. If fetch fails (401), user is not authenticated
 * 
 * React Query handles:
 * - Caching (5 min staleTime)
 * - Deduplication (multiple calls use same request)
 * - Background refetching
 */

'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth-store';
import { authApi } from '@/lib/api/auth';

export function useAuthSync() {
  const { setUser, clearAuth } = useAuthStore();

  // Fetch user data - if httpOnly cookies exist, backend will return user
  const { data: user, isError, isSuccess, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.getMe(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on tab focus
  });

  useEffect(() => {
    if (isSuccess && user) {
      // Sync Zustand store with backend data
      setUser(user);
    } else if (isError) {
      // Backend says not authenticated - clear local state
      clearAuth();
    }
  }, [isSuccess, isError, user, setUser, clearAuth]);

  return {
    isLoading,
    isAuthenticated: isSuccess && !!user,
    user,
  };
}
