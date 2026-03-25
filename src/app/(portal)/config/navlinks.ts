import { FileKey, MousePointerClick, SquareChartGantt, UsersRound } from "lucide-react";

import { hasRole, ROLES } from "@/lib/auth/roles";
import type { UserDetailResponse } from "@/lib/api/auth";

export type NavLink = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type NavGroup = {
  label: string;
  items: NavLink[];
};

/**
 * Get navigation links based on user role
 * Portal Admin: Full access to all features
 * Portal User: Only profile and activity access
 */
export function getNavLinks(user: UserDetailResponse | null): NavGroup[] {
  const isAdmin = user ? hasRole(user, [ROLES.PORTAL_ADMIN]) : false;

  return [
    {
      label: "Application",
      items: [
        {
          title: "Overview",
          href: "/portal",
          icon: SquareChartGantt,
        },
        // Portal Admin only features
        ...(isAdmin
          ? [
            {
              title: "Team Members",
              href: "/portal/team-members",
              icon: UsersRound,
            },
            {
              title: "API Keys",
              href: "/portal/api-keys",
              icon: FileKey,
            },
            {
              title: "Usage Reports",
              href: "/portal/usage-reports",
              icon: MousePointerClick,
            },
          ]
          : []),
      ],
    },
  ];
}

// Deprecated: Use getNavLinks instead
export const navLinks: NavGroup[] = [
  {
    label: "Application",
    items: [
      {
        title: "Overview",
        href: "/portal",
        icon: SquareChartGantt,
      },
      {
        title: "Team Members",
        href: "/portal/team-members",
        icon: UsersRound,
      },
      {
        title: "API Keys",
        href: "/portal/api-keys",
        icon: FileKey,
      },
      {
        title: "Usage Reports",
        href: "/portal/usage-reports",
        icon: MousePointerClick,
      },
    ],
  },
];
