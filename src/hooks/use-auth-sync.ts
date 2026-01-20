/**
 * Auth Sync Hook
 * 
 * Synchronizes Zustand auth state with backend session on app mount.
 * This replaces the AuthInitializer pattern with a cleaner hook-based approach.
 * 
 * How it works:
 * 1. Wait for Zustand to hydrate from localStorage
 * 2. If user claims to be authenticated, verify with backend
 * 3. Update Zustand store with fresh user data or clear if invalid
 */

'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth-store';
import { authApi } from '@/lib/api/auth';

export function useAuthSync() {
  const { isAuthenticated, _hasHydrated, setUser, clearAuth } = useAuthStore();

  // Only fetch user data if:
  // 1. Store has hydrated from localStorage
  // 2. Store claims user is authenticated
  // This prevents unnecessary API calls
  const shouldFetch = _hasHydrated && isAuthenticated;

  const { data: user, isError, isSuccess } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.getMe(),
    enabled: shouldFetch,
    retry: false,
    staleTime: Infinity, // Don't refetch unless explicitly invalidated
  });

  useEffect(() => {
    if (!shouldFetch) return;

    if (isSuccess && user) {
      // Sync Zustand store with backend data
      setUser(user);
    } else if (isError) {
      // Backend says not authenticated - clear local state
      clearAuth();
    }
  }, [isSuccess, isError, user, shouldFetch, setUser, clearAuth]);

  return {
    isLoading: shouldFetch && !isSuccess && !isError,
    isAuthenticated: isAuthenticated && isSuccess,
    user,
  };
}
