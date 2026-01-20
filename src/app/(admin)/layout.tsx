"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "./_components/admin-sidebar";
import { AdminHeader } from "./_components/admin-header";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useAuthSync } from "@/hooks/use-auth-sync";
import { Loader2 } from "lucide-react";
import { isSuperAdmin } from "@/lib/auth-utils";
import { toast } from "sonner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, _hasHydrated } = useAuthStore();
    const { user, isLoading } = useAuthSync();
    
    // Read sidebar state from cookie
    const [defaultOpen, setDefaultOpen] = useState(true);
    
    useEffect(() => {
        const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
        };
        
        const sidebarState = getCookie('sidebar_state');
        setDefaultOpen(sidebarState === 'true');
    }, []);

    useEffect(() => {
        // Wait for hydration and initial auth check
        if (!_hasHydrated || isLoading) return;

        // Check authentication first
        if (!isAuthenticated) {
            router.replace('/login');
            return;
        }

        // Check authorization - only SUPER_ADMIN can access /admin routes
        // Wait for user data to be loaded before checking roles
        if (user && !isSuperAdmin(user)) {
            toast.error('Access denied. Super Admin privileges required.');
            router.replace('/portal');
        }
    }, [isAuthenticated, user, _hasHydrated, isLoading, router]);

    // Show loading state while hydrating, authenticating, or checking authorization
    if (!_hasHydrated || isLoading || !isAuthenticated || !user || !isSuperAdmin(user)) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <AdminSidebar />
            <div className="flex min-h-screen w-full flex-col">
                <AdminHeader />
                <main className="m-2 mt-0 flex-1 rounded-md border border-zinc-300 p-4">{children}</main>
            </div>
        </SidebarProvider>
    );
}
