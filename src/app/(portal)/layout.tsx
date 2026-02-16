"use client";

import { Loader2 } from "lucide-react";
import { useMemo } from "react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { ROLES } from "@/lib/auth/roles";
import { getCookie } from "@/lib/utils";

import { PortalHeader } from "./_components/portal-header";
import { PortalSidebar } from "./_components/portal-sidebar";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthorized } = useRequireAuth({
    requiredRoles: [ROLES.PORTAL_ADMIN, ROLES.PORTAL_USER],
    fallbackPath: "/admin",
  });

  const defaultOpen = useMemo(() => {
    const sidebarState = getCookie("sidebar_state");
    return sidebarState !== "false";
  }, []);

  if (isLoading || !isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider key="portal-sidebar" defaultOpen={defaultOpen}>
      <PortalSidebar />
      <div className="flex min-h-screen w-full flex-col">
        <PortalHeader />
        <main className="m-2 mt-0 flex-1 rounded-md border border-zinc-300 p-4">{children}</main>
      </div>
    </SidebarProvider>
  );
}
