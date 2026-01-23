"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";

import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuthSync } from "@/hooks/use-auth-sync";
import { isSuperAdmin } from "@/lib/auth-utils";
import { useAuthStore } from "@/lib/stores/auth-store";

import { AdminHeader } from "./_components/admin-header";
import { AdminSidebar } from "./_components/admin-sidebar";

// Helper function to read cookie
function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { user, isLoading } = useAuthSync();

  // Read sidebar state from cookie synchronously
  const defaultOpen = useMemo(() => {
    const sidebarState = getCookie("sidebar_state");
    return sidebarState !== "false"; // Default to true unless explicitly set to false
  }, []);

  useEffect(() => {
    // Wait for initial auth check
    if (isLoading) return;

    // Check authentication first
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    // Check authorization - only SUPER_ADMIN can access /admin routes
    // Wait for user data to be loaded before checking roles
    if (user && !isSuperAdmin(user)) {
      toast.error("Access denied. Super Admin privileges required.");
      router.replace("/portal");
    }
  }, [isAuthenticated, user, isLoading, router]);

  // Show loading state while hydrating, authenticating, or checking authorization
  if (isLoading || !isAuthenticated || !user || !isSuperAdmin(user)) {
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
