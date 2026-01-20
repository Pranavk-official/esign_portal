"use client"

import { AppHeader } from "@/components/shared/app-header"
import { navLinks } from "@/app/(portal)/config/navlinks"

export function PortalHeader() {
  return (
    <AppHeader
      navLinks={navLinks}
      baseHref="/portal"
      showUserEmail={false}
    />
  )
}
