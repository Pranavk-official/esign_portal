import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface UserInfo {
  id: string;
  email: string;
  portal_id: string | null;
  is_active: boolean;
  roles: string[];
}

interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: UserInfo) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // DEV: Default to logged in for development
      user: {
        id: 'dev-user',
        email: 'dev@example.com',
        portal_id: 'dev-portal',
        is_active: true,
        roles: ['SUPER_ADMIN']
      },
      isAuthenticated: true,

      setUser: (user) => 
        set({ user, isAuthenticated: true }),
      
      clearAuth: () => 
        set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage-dev', // Changed for dev to ignore previous auth state
      storage: createJSONStorage(() => localStorage),
    }
  )
);
