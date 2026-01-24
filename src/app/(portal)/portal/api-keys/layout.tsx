"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { useAuthStore } from "@/lib/stores/auth-store";

/**
 * Layout protection for API Keys page
 * Only portal_admin can access this page
 */
export default function ApiKeysLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    const isPortalAdmin = user.roles?.some((role) => role.name === "portal_admin");
    if (!isPortalAdmin) {
      toast.error("Access denied. Portal Admin privileges required.");
      router.replace("/portal");
    }
  }, [user, router]);

  // Show loading while checking permissions
  const isPortalAdmin = user?.roles?.some((role) => role.name === "portal_admin");
  if (!user || !isPortalAdmin) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
