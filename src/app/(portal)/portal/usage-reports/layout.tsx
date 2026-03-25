"use client";

import { Loader2 } from "lucide-react";

import { useRequireAuth } from "@/hooks/use-require-auth";
import { ROLES } from "@/lib/auth/roles";

/**
 * Layout protection for Usage Reports page
 * Only portal_admin can access this page
 */
export default function UsageReportsLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthorized } = useRequireAuth({
    requiredRoles: [ROLES.PORTAL_ADMIN],
    fallbackPath: "/portal",
  });

  if (isLoading || !isAuthorized) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
