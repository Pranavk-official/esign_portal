"use client"

import { AppSidebar } from "@/components/shared/app-sidebar"
import { navLinks } from "@/app/(admin)/config/navlinks"
import { userMenuItems } from "@/app/(admin)/config/user-menu-items"

export function AdminSidebar() {
    return (
        <AppSidebar
            appName="Admin"
            navLinks={navLinks}
            userMenuItems={userMenuItems}
            userName="Admin User"
            baseHref="/admin"
        />
    )
}
