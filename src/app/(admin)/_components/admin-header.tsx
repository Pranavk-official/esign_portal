"use client";

import { navLinks } from "@/app/(admin)/config/navlinks";
import { AppHeader } from "@/components/shared/app-header";

export function AdminHeader() {
  return <AppHeader navLinks={navLinks} baseHref="/admin" showUserEmail={true} />;
}
