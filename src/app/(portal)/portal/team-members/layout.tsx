"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/stores/auth-store"
import { isPortalAdmin } from "@/lib/auth-utils"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

/**
 * Layout protection for Team Members page
 * Only portal_admin can access this page
 */
export default function TeamMembersLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user) return

    if (!isPortalAdmin(user)) {
      toast.error("Access denied. Portal Admin privileges required.")
      router.replace("/portal")
    }
  }, [user, router])

  // Show loading while checking permissions
  if (!user || !isPortalAdmin(user)) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <>{children}</>
}
