"use client";

import { Loader2 } from "lucide-react";
import { useMemo } from "react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { ROLES } from "@/lib/auth/roles";
import { getCookie } from "@/lib/utils";

import { AdminHeader } from "./_components/admin-header";
import { AdminSidebar } from "./_components/admin-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthorized } = useRequireAuth({
    requiredRoles: [ROLES.SUPER_ADMIN],
    fallbackPath: "/portal",
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
    <SidebarProvider key="admin-sidebar" defaultOpen={defaultOpen}>
      <AdminSidebar />
      <div className="flex min-h-screen w-full flex-col">
        <AdminHeader />
        <main className="m-2 mt-0 flex-1 rounded-md border border-zinc-300 p-4">{children}</main>
      </div>
    </SidebarProvider>
  );
}
