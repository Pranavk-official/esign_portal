import { User, Activity, Bell } from "lucide-react"

export type UserMenuItem = {
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
}

export const userMenuItems: UserMenuItem[] = [
    {
        title: "Profile",
        href: "/portal/profile",
        icon: User,
    },
    {
        title: "Activity",
        href: "/portal/activity",
        icon: Activity,
    },
    {
        title: "Notifications",
        href: "/portal/notifications",
        icon: Bell,
    },
]
