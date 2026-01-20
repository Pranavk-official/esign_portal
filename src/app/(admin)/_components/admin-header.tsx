"use client"

import { AppHeader } from "@/components/shared/app-header"
import { navLinks } from "@/app/(admin)/config/navlinks"

export function AdminHeader() {
    return (
        <AppHeader
            navLinks={navLinks}
            baseHref="/admin"
            showUserEmail={true}
        />
    )
}
