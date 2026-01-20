"use client"

import { AppSidebar } from "@/components/shared/app-sidebar"
import { navLinks } from "@/app/(portal)/config/navlinks"
import { userMenuItems } from "@/app/(portal)/config/user-menu-items"

export function PortalSidebar() {
  return (
    <AppSidebar
      appName="Portal"
      navLinks={navLinks}
      userMenuItems={userMenuItems}
      userName="John Doe"
      baseHref="/portal"
    />
  )
}
