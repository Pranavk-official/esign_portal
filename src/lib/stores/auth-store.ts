import { create } from 'zustand';
import type { UserDetailResponse } from '@/lib/api/auth';

// Re-export for convenience — the authoritative shape comes from the OpenAPI spec.
export type UserInfo = UserDetailResponse;

interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: UserInfo) => void;
  clearAuth: () => void;
}

/**
 * In-memory auth store.
 *
 * We intentionally do NOT persist this to localStorage:
 * - The actual session lives in HttpOnly cookies (inaccessible to JS).
 * - Storing user PII (email, roles, id) in localStorage would expose it to XSS.
 * - On page reload the root page.tsx calls /users/me to re-hydrate this store.
 */
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: true }),

  clearAuth: () => set({ user: null, isAuthenticated: false }),
}));
