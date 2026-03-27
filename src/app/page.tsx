"use client"

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import type { RoleResponse } from "@/lib/api/auth";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth-store";

/**
 * Root page — resolves role-based routing for authenticated users.
 *
 * proxy.ts already guards this route: unauthenticated users are redirected to
 * /login before they ever reach here. This page only handles the case where a
 * user IS authenticated (has the access_token cookie) but we need to decide
 * whether to send them to /admin or /portal based on their roles.
 *
 * We call /users/me to:
 * 1. Re-hydrate the in-memory auth store (no more stale localStorage data)
 * 2. Get fresh roles for redirect decision
 */
export default function Home() {
  const router = useRouter();
  const { setUser, user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    function redirectByRole(roles: RoleResponse[]) {
      const hasRole = (name: string) =>
        roles.some((r) => r.name.toUpperCase() === name.toUpperCase());

      if (hasRole('SUPER_ADMIN')) {
        router.replace('/admin');
      } else {
        router.replace('/portal');
      }
    }

    // If already hydrated in-memory, do role-based redirect immediately
    if (isAuthenticated && user) {
      redirectByRole(user.roles);
      return;
    }

    // Otherwise fetch fresh user info from backend
    authApi.getMe()
      .then((userData) => {
        setUser(userData);
        redirectByRole(userData.roles);
      })
      .catch(() => {
        // /users/me failed — refresh token may be expired too.
        // The Axios interceptor will handle the refresh attempt and redirect
        // to /login on failure. We just clear state here as a fallback.
        router.replace('/login');
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
