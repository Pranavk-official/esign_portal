"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

type NavLink = {
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
}

type NavGroup = {
    label: string
    items: NavLink[]
}

type AppHeaderProps = {
    navLinks: NavGroup[]
    baseHref: string
    showUserEmail?: boolean
    userEmail?: string
}

export function AppHeader({
    navLinks,
    baseHref,
    showUserEmail = false,
    userEmail = "user@example.com"
}: AppHeaderProps) {
    const pathname = usePathname()

    const items = navLinks.flatMap(group => group.items)

    const currentItem = items.find(item =>
        item.href === baseHref
            ? pathname === baseHref || pathname === baseHref + "/"
            : pathname === item.href || pathname.startsWith(item.href + "/")
    )

    const pageTitle = currentItem?.title ?? "Dashboard"

    return (
        <header className="flex h-14 items-center gap-4 border border-zinc-300 bg-background m-2 p-2 rounded-md">
            <SidebarTrigger />

            <div className="flex flex-1 items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Home</span>
                    <span>›</span>
                    <span className="text-foreground font-semibold">{pageTitle}</span>
                </div>

                {showUserEmail && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{userEmail}</span>
                    </div>
                )}
            </div>
        </header>
    )
}
