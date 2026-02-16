import { create } from "zustand";

import type { UserDetailResponse } from "@/lib/schemas/auth";

/**
 * Auth Store — Single source of truth for client-side auth state.
 *
 * Holds both the authentication flag AND the current user object.
 * React Query fetches/refreshes the data; Zustand is the canonical store
 * that the rest of the app reads from via selectors.
 *
 * Why store user here (not only in React Query)?
 * - Eliminates sync issues between RQ cache and a boolean-only flag
 * - Allows non-React code (e.g., Axios interceptor) to read user state
 * - Components select only the slices they need → fewer re-renders
 *
 * Why no localStorage?
 * - Session is maintained via HttpOnly cookies (secure)
 * - On hard refresh, `getMe()` re-hydrates the store from the backend
 */

interface AuthState {
  user: UserDetailResponse | null;
  isAuthenticated: boolean;

  setUser: (user: UserDetailResponse) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: true }),

  clearAuth: () => set({ user: null, isAuthenticated: false }),
}));
