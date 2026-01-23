"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { isPortalAdmin } from "@/lib/auth-utils";
import { useAuthStore } from "@/lib/stores/auth-store";

/**
 * Layout protection for Usage Reports page
 * Only portal_admin can access this page
 */
export default function UsageReportsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    if (!isPortalAdmin(user)) {
      toast.error("Access denied. Portal Admin privileges required.");
      router.replace("/portal");
    }
  }, [user, router]);

  // Show loading while checking permissions
  if (!user || !isPortalAdmin(user)) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
