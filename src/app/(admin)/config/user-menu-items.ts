import { User, Settings } from "lucide-react"

export type UserMenuItem = {
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
}

export const userMenuItems: UserMenuItem[] = [
    {
        title: "Account",
        href: "/admin/account",
        icon: User,
    },
    {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
    },
]
