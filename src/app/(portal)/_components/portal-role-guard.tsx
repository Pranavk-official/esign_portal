"use client";

import { Loader2 } from "lucide-react";

import { useRoleGuard } from "@/lib/hooks/use-role-guard";

/**
 * Guards the portal section. Allows PORTAL_ADMIN and PORTAL_USER roles.
 * Redirects SUPER_ADMINs (who have no portal) back to /admin.
 */
export function PortalRoleGuard({ children }: { children: React.ReactNode }) {
  // Any role except SUPER_ADMIN is allowed (portal_admin, portal_user, etc.)
  // useRoleGuard with `null` would allow any authenticated user; we pass the
  // full list of portal roles to block super_admins from landing here after
  // a direct URL navigation. If they have none of these roles → redirect /admin.
  const status = useRoleGuard(["PORTAL_ADMIN", "PORTAL_USER"], "/admin");

  if (status === "loading" || status === "redirecting") {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
