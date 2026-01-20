import { User, Activity, Bell } from "lucide-react"

export type UserMenuItem = {
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
}

export const userMenuItems: UserMenuItem[] = [
    {
        title: "Profile",
        href: "/admin/profile",
        icon: User,
    },
    {
        title: "Activity",
        href: "/admin/activity",
        icon: Activity,
    },
    {
        title: "Notifications",
        href: "/admin/notifications",
        icon: Bell,
    },
]
