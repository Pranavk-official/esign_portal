"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { RoleResponse } from "@/lib/api/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const { isAuthenticated, user } = useAuthStore.getState();
    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }
    // Role-based redirect for authenticated users
    const roles = user.roles || [];
    const hasRole = (roleName: string) =>
      roles.some((r: RoleResponse) => r.name.toUpperCase() === roleName.toUpperCase());

    if (hasRole('SUPER_ADMIN')) {
      router.replace('/admin');
    } else {
      router.replace('/portal');
    }
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
