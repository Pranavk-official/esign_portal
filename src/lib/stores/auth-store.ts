import { create } from "zustand";

import { UserDetailResponse } from "@/lib/api/types";

/**
 * Auth Store
 *
 * Manages authentication state in memory only.
 * Actual session is maintained via httpOnly cookies on the backend.
 *
 * Why no localStorage?
 * - Session tokens are stored in httpOnly cookies (secure)
 * - User data is cached by React Query
 * - localStorage would create sync issues with actual session state
 * - Prevents stale data after session expires
 */

interface AuthState {
  user: UserDetailResponse | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: UserDetailResponse) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: true }),

  clearAuth: () => set({ user: null, isAuthenticated: false }),
}));
