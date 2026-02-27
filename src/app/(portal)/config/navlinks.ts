import {
  Home,
  Inbox,
  Calendar,
  Search,
  Settings,
  UsersRound,
  SquareChartGantt,
  FileKey,
  MousePointerClick,
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

]
