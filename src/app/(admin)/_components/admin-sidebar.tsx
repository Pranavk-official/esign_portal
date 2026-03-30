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
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/lib/stores/auth-store";

import { AdminUserMenu } from "./admin-user-menu";

export function AdminSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  // SuperAdminGuard guarantees the store is hydrated before this renders.
  const user = useAuthStore((s) => s.user);

  return (
    <Sidebar collapsible="icon" variant="floating" className="py-2 group-data-[variant=floating]:border-zinc-300">
      <SidebarHeader>
        <div className={`text-sm font-semibold ${state === "expanded" ? "text-center" : "flex items-center justify-center px-2 h-10"}`}>
          Admin Panel
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navLinks.map((group, groupIndex) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item, itemIndex) => {
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin" || pathname === "/admin/"
                      : pathname === item.href || pathname.startsWith(item.href + "/");
                  
                  // Calculate stagger index
                  const itemsInPreviousGroups = navLinks.slice(0, groupIndex).reduce((sum, g) => sum + g.items.length, 0);
                  const staggerIndex = itemsInPreviousGroups + itemIndex;

                  return (
                    <SidebarMenuItem key={item.title} className={state === "expanded" ? `stagger-item stagger-item-${Math.min(staggerIndex, 9)}` : ""}>
                      <SidebarMenuButton asChild isActive={isActive} className="transition-all duration-200 hover:bg-indigo-50">
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
