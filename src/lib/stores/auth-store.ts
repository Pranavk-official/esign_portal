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
      user: null,
      isAuthenticated: false,

      setUser: (user) => 
        set({ user, isAuthenticated: true }),
      
      clearAuth: () => 
        set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage', // Still persists user info to keep UI "logged in" across tabs
      storage: createJSONStorage(() => localStorage),
    }
  )
);
