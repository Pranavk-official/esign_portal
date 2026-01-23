"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { PortalSidebar } from "./_components/portal-sidebar";
import { PortalHeader } from "./_components/portal-header";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useAuthSync } from "@/hooks/use-auth-sync";
import { Loader2 } from "lucide-react";
import { isSuperAdmin, isPortalAdmin, isUser } from "@/lib/auth-utils";
import { toast } from "sonner";

// Helper function to read cookie
function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { user, isLoading } = useAuthSync();
  
  // Read sidebar state from cookie synchronously
  const defaultOpen = useMemo(() => {
    const sidebarState = getCookie('sidebar_state');
    return sidebarState !== 'false'; // Default to true unless explicitly set to false
  }, []);

  useEffect(() => {
    // Wait for initial auth check
    if (isLoading) return;

    // Check authentication first
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    // Wait for user data to be loaded before checking roles
    if (!user) return;

    // Check authorization - only PORTAL_ADMIN and USER can access /portal routes
    // If user is SUPER_ADMIN, redirect them to their proper admin dashboard
    if (isSuperAdmin(user)) {
      toast.info('Redirecting to admin dashboard...');
      router.replace('/admin');
      return;
    }

    // Only allow PORTAL_ADMIN and USER roles here
    if (!isPortalAdmin(user) && !isUser(user)) {
      toast.error('Access denied. Invalid user role.');
      router.replace('/login');
    }
  }, [isAuthenticated, user, isLoading, router]);

  // Show loading state while checking auth and authorization
  if (isLoading || !isAuthenticated || !user || isSuperAdmin(user)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // At this point, user must be PORTAL_ADMIN or USER
  if (!isPortalAdmin(user) && !isUser(user)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
