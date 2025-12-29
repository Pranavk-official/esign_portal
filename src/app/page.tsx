"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const roles = user?.roles || [];

    if (roles.includes("SUPER_ADMIN")) {
      router.push("/admin");
    } else if (roles.includes("PORTAL_ADMIN")) {
      router.push("/portal");
    } else {
      // Default fallback
      router.push("/portal");
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
