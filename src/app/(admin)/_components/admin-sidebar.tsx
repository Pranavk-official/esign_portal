"use client";

import { navLinks } from "@/app/(admin)/config/navlinks";
import { userMenuItems } from "@/app/(admin)/config/user-menu-items";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { useCurrentUser } from "@/hooks/use-auth";

export function AdminSidebar() {
  const { user } = useCurrentUser();

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
