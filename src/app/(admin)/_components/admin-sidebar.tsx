"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navLinks } from "@/app/(admin)/config/navlinks";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/lib/stores/auth-store";

import { AdminUserMenu } from "./admin-user-menu";

export function AdminSidebar() {
  const pathname = usePathname();
  // SuperAdminGuard guarantees the store is hydrated before this renders.
  const user = useAuthStore((s) => s.user);

  return (
    <Sidebar collapsible="icon" variant="floating" className="py-2 group-data-[variant=floating]:border-zinc-300">
      <SidebarHeader>
        <div className="text-sm font-semibold text-center">Admin Panel</div>
      </SidebarHeader>

      <SidebarContent>
        {navLinks.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin" || pathname === "/admin/"
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

      <SidebarFooter>
        <AdminUserMenu email={user?.email ?? ""} />
      </SidebarFooter>
    </Sidebar>
  );
}
