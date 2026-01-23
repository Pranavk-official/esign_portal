"use client";

import { navLinks } from "@/app/(admin)/config/navlinks";
import { userMenuItems } from "@/app/(admin)/config/user-menu-items";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { useAuthStore } from "@/lib/stores/auth-store";

export function AdminSidebar() {
  const { user } = useAuthStore();

  return (
    <AppSidebar
      appName="Admin Console"
      navLinks={navLinks}
      userMenuItems={userMenuItems}
      userName={user?.email || "Admin User"}
      baseHref="/admin"
    />
  );
}
