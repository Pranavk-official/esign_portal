"use client";

import { navLinks } from "@/app/(portal)/config/navlinks";
import { AppHeader } from "@/components/shared/app-header";

export function PortalHeader() {
  return <AppHeader navLinks={navLinks} baseHref="/portal" showUserEmail={false} />;
}
