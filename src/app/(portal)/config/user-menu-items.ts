import { User, Settings } from "lucide-react"

export type UserMenuItem = {
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
}

export const userMenuItems: UserMenuItem[] = [
    {
        title: "Account",
        href: "/portal/account",
        icon: User,
    },
    {
        title: "Settings",
        href: "/portal/settings",
        icon: Settings,
    },
]
