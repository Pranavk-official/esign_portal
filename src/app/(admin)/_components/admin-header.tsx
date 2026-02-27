"use client"

import { usePathname } from "next/navigation"

import { navLinks } from "@/app/(admin)/config/navlinks"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function AdminHeader() {
  const pathname = usePathname()

  const items = navLinks.flatMap((group) => group.items)

  const currentItem = items.find((item) =>
    item.href === "/admin"
      ? pathname === "/admin" || pathname === "/admin/"
      : pathname === item.href || pathname.startsWith(item.href + "/")
  )

  const pageTitle = currentItem?.title ?? "Dashboard"

  return (
    <header className="flex h-14 items-center gap-4 border border-zinc-300 bg-background m-2 p-2 rounded-md">
      <SidebarTrigger />

      <div className="flex flex-1 items-center justify-between">
        <h1 className="text-lg font-semibold">{pageTitle}</h1>
      </div>
    </header>
  )
}
