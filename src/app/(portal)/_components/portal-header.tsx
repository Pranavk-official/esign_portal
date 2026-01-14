"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import { usePathname } from "next/navigation"
import { navLinks } from "@/app/(portal)/config/navlinks"

export function PortalHeader() {
  const pathname = usePathname()

  const items = navLinks.flatMap(group => group.items)


  const currentItem = items.find(item =>
    item.href === "/portal"
      ? pathname === "/portal" || pathname === "/portal/"
      : pathname === item.href || pathname.startsWith(item.href + "/")
  )

  const pageTitle = currentItem?.title ?? "Dashboard"

  return (
    <header className="flex h-14 items-center gap-4 border border-zinc-300 bg-background m-2 p-2 rounded-md">
      <SidebarTrigger />

      <div className="flex flex-1 items-center justify-between">
        <h1 className="text-lg font-semibold">
          {pageTitle}
        </h1>

        {/* <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
        </div> */}
      </div>
    </header>
  )
}
