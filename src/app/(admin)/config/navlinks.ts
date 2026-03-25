import { Activity, Boxes, FileText, LayoutDashboard, Settings, Users } from "lucide-react";

export type NavLink = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type NavGroup = {
  label: string;
  items: NavLink[];
};

export const navLinks: NavGroup[] = [
  {
    label: "Application",
    items: [
      {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      },
      {
        title: "Portals",
        href: "/admin/portals",
        icon: Boxes,
      },
      {
        title: "Global Users",
        href: "/admin/users",
        icon: Users,
      },
      {
        title: "API Usage",
        href: "/admin/api-usage",
        icon: Activity,
      },
      {
        title: "Audit Logs",
        href: "/admin/audit-logs",
        icon: FileText,
      },
      {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];
