"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

import { UserMenu } from "./user-menu";

export type NavLink = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type NavGroup = {
  label: string;
  items: NavLink[];
};

type UserMenuItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type AppSidebarProps = {
  appName: string;
  navLinks: NavGroup[];
  userMenuItems: UserMenuItem[];
  userName?: string;
  baseHref: string;
};

export function AppSidebar({
  appName,
  navLinks,
  userMenuItems,
  userName = "User",
  baseHref,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { state } = useSidebar();

  // Get initials from app name
  const initials = appName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      className="py-2 group-data-[variant=floating]:border-zinc-300"
    >
      <SidebarHeader>
        {state === "collapsed" ? (
          <div className="flex items-center justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              {initials}
            </div>
          </div>
        ) : (
          <div className="text-center text-sm font-semibold">{appName}</div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {navLinks.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    item.href === baseHref
                      ? pathname === baseHref || pathname === baseHref + "/"
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
        <UserMenu name={userName} menuItems={userMenuItems} />
      </SidebarFooter>
    </Sidebar>
  );
}
