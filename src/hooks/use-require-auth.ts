import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

import { useCurrentUser } from "@/hooks/use-auth";
import { hasRole, type RoleName } from "@/lib/auth/roles";

interface UseRequireAuthOptions {
  /** Roles that grant access to this route group. */
  requiredRoles: RoleName[];
  /**
   * Where to redirect if the user is authenticated but lacks the required role.
   * Defaults to "/" (the role-based redirect page).
   */
  fallbackPath?: string;
}

/**
 * useRequireAuth — client-side route guard for protected layouts.
 *
 * 1. Fetches `/users/me` (via useCurrentUser) to hydrate auth state.
 * 2. If the user is not authenticated → redirect to `/login`.
 * 3. If authenticated but missing the required role → redirect to `fallbackPath`.
 * 4. Otherwise → render the layout normally.
 *
 * This is the **secondary** guard (proxy.ts is primary). Both must agree
 * to let a request through — defense in depth.
 */
export function useRequireAuth({ requiredRoles, fallbackPath = "/" }: UseRequireAuthOptions) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useCurrentUser();

  const isAuthorized = useMemo(() => {
    if (!user) return false;
    return hasRole(user, requiredRoles);
  }, [user, requiredRoles]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!isAuthorized) {
      router.replace(fallbackPath);
    }
  }, [isLoading, isAuthenticated, isAuthorized, router, fallbackPath]);

  return {
    user,
    isLoading,
    isAuthenticated,
    isAuthorized,
  };
}
