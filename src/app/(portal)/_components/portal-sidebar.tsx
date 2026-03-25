"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/app/(portal)/config/navlinks";
import { useAuthStore } from "@/lib/stores/auth-store";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

import { SidebarUserMenu } from "./user-menu";

export function PortalSidebar() {
  const pathname = usePathname();
  // PortalRoleGuard guarantees the store is hydrated before this renders.
  const user = useAuthStore((s) => s.user);

  return (
    <Sidebar collapsible="icon" variant="floating" className="py-2 group-data-[variant=floating]:border-zinc-300">
      <SidebarHeader>
        <div className="text-sm font-semibold text-center">My App</div>
      </SidebarHeader>

      <SidebarContent>
        {navLinks.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    item.href === "/portal"
                      ? pathname === "/portal" || pathname === "/portal/"
                      : pathname === item.href || pathname.startsWith(item.href + "/");

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* ---------- USER DROPDOWN ---------- */}
      <SidebarFooter>
        <SidebarUserMenu email={user?.email ?? ""} />
      </SidebarFooter>
    </Sidebar>
  );
}
