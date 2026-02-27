"use client";

import { Loader2 } from "lucide-react";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";

/**
 * Client component that enforces SUPER_ADMIN role.
 * Shows a loading spinner while the auth check is in-flight, then either
 * renders children (authorized) or silently redirects (unauthorized).
 *
 * Non-super-admins are redirected to /portal (they may legitimately be portal_admins).
 */
export function SuperAdminGuard({ children }: { children: React.ReactNode }) {
  const status = useRoleGuard(["SUPER_ADMIN"], "/portal");

  if (status === "loading" || status === "redirecting") {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
