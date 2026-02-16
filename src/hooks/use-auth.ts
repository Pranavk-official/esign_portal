import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { authApi } from "@/lib/api/auth";
import { authKeys } from "@/lib/auth/query-keys";
import { useAuthStore } from "@/lib/stores/auth-store";

/**
 * useCurrentUser — fetches `/users/me` via React Query and syncs the
 * result into Zustand so the rest of the app has a single read source.
 *
 * On success → `authStore.setUser(user)`.
 * On error   → `authStore.clearAuth()` (cookie expired / invalid).
 *
 * Components should read user data from `useAuthStore((s) => s.user)`,
 * but *this* hook must be mounted somewhere high in the tree (e.g. the
 * root page or the layout guards) so the data stays fresh.
 */
export function useCurrentUser() {
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const query = useQuery({
    queryKey: authKeys.me(),
    queryFn: authApi.getMe,
    retry: false, // Don't retry on 401 — the interceptor already handles refresh
    staleTime: 2 * 60 * 1000, // 2 min — user profile rarely changes mid-session
  });

  // Sync React Query state → Zustand
  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    }
  }, [query.data, setUser]);

  useEffect(() => {
    if (query.isError) {
      clearAuth();
    }
  }, [query.isError, clearAuth]);

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isAuthenticated: query.isSuccess && isAuthenticated,
    error: query.error,
  };
}
