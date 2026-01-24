"use client";

import { usePathname } from "next/navigation";

import { SidebarTrigger } from "@/components/ui/sidebar";

type NavLink = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavGroup = {
  label: string;
  items: NavLink[];
};

type AppHeaderProps = {
  navLinks: NavGroup[];
  baseHref: string;
  showUserEmail?: boolean;
  userEmail?: string;
};

export function AppHeader({
  navLinks,
  baseHref,
}: AppHeaderProps) {
  const pathname = usePathname();

  const items = navLinks.flatMap((group) => group.items);

  const currentItem = items.find((item) =>
    item.href === baseHref
      ? pathname === baseHref || pathname === baseHref + "/"
      : pathname === item.href || pathname.startsWith(item.href + "/")
  );

  const pageTitle = currentItem?.title ?? "Dashboard";

  return (
    <header className="bg-background m-2 flex h-14 items-center gap-4 rounded-md border border-zinc-300 p-2">
      <SidebarTrigger />

      <div className="flex flex-1 items-center justify-between">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <span>Home</span>
          <span>›</span>
          <span className="text-foreground font-semibold">{pageTitle}</span>
        </div>
      </div>
    </header>
  );
}
