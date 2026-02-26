import {
  SquareChartGantt,
  Building2,
  UsersRound,
  ScrollText,
} from "lucide-react"

export type NavLink = {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export type NavGroup = {
  label: string
  items: NavLink[]
}

export const navLinks: NavGroup[] = [
  {
    label: "Management",
    items: [
      {
        title: "Dashboard",
        href: "/admin",
        icon: SquareChartGantt,
      },
      {
        title: "Portals",
        href: "/admin/portals",
        icon: Building2,
      },
      {
        title: "Users",
        href: "/admin/users",
        icon: UsersRound,
      },
    ],
  },
]
