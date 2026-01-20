'use client';

import { useEffect } from 'react';
import { useAuthSync } from '@/hooks/use-auth-sync';

/**
 * Auth Provider Component
 * 
 * Handles auth initialization at the root level.
 * Must be client-side and wrap the entire app.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize auth sync - this will run once on app mount
  useAuthSync();

  return <>{children}</>;
}
