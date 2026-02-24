import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserDetailResponse } from '@/lib/api/auth';

// Re-export for convenience — the authoritative shape comes from the OpenAPI spec.
export type UserInfo = UserDetailResponse;

interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;

  // Actions
  setUser: (user: UserInfo) => void;
  clearAuth: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setUser: (user) =>
        set({ user, isAuthenticated: true }),

      clearAuth: () =>
        set({ user: null, isAuthenticated: false }),

      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
