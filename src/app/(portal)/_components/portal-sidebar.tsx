"use client";

import { getNavLinks } from "@/app/(portal)/config/navlinks";
import { userMenuItems } from "@/app/(portal)/config/user-menu-items";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { useCurrentUser } from "@/hooks/use-auth";

export function PortalSidebar() {
  const { user } = useCurrentUser();

  // Get role-based navigation links
  const navLinks = getNavLinks(user);

  return (
    <AppSidebar
      appName="Portal"
      navLinks={navLinks}
      userMenuItems={userMenuItems}
      userName={user?.email || "Portal User"}
      baseHref="/portal"
    />
  );
}
