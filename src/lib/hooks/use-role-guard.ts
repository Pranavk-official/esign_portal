"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth-store";

export type RoleGuardStatus = "loading" | "authorized" | "redirecting";

/**
 * Hydrates the auth store (calls /users/me if needed) and enforces a role
 * requirement. Returns the current gate status so the caller can show a
 * loading state while the check is in-flight.
 *
 * @param allowedRoles - Role names that may access the route (case-insensitive).
 *                       Pass `null` to allow any authenticated user.
 * @param redirectTo   - Where to send unauthorised users (default: "/").
 */
export function useRoleGuard(
  allowedRoles: string[] | null,
  redirectTo = "/"
): RoleGuardStatus {
  const router = useRouter();
  const { user, isAuthenticated, setUser, clearAuth } = useAuthStore();
  const [status, setStatus] = useState<RoleGuardStatus>("loading");

  useEffect(() => {
    async function check() {
      let resolvedUser = user;

      // If the store hasn't been hydrated yet (fresh page load / hard navigate),
      // fetch the current user from the backend first.
      if (!isAuthenticated || !resolvedUser) {
        try {
          resolvedUser = await authApi.getMe();
          setUser(resolvedUser);
        } catch {
          // Token missing / expired — the Axios interceptor already tried a
          // refresh and failed; clear state and go to login.
          clearAuth();
          router.replace("/login");
          setStatus("redirecting");
          return;
        }
      }

      // Any authenticated user is allowed (no role restriction).
      if (allowedRoles === null) {
        setStatus("authorized");
        return;
      }

      const userRoles = (resolvedUser?.roles ?? []).map((r) =>
        r.name.toUpperCase()
      );
      const hasRole = allowedRoles
        .map((r) => r.toUpperCase())
        .some((r) => userRoles.includes(r));

      if (hasRole) {
        setStatus("authorized");
      } else {
        router.replace(redirectTo);
        setStatus("redirecting");
      }
    }

    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return status;
}
