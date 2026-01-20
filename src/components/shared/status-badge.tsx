"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type StatusType = "active" | "inactive" | "pending" | "revoked" | "expired"

interface StatusBadgeProps {
  status: boolean | StatusType
  activeLabel?: string
  inactiveLabel?: string
  showIcon?: boolean
  className?: string
}

export function StatusBadge({
  status,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
  showIcon = true,
  className,
}: StatusBadgeProps) {
  // Normalize status to string
  let statusType: StatusType
  if (typeof status === "boolean") {
    statusType = status ? "active" : "inactive"
  } else {
    statusType = status
  }

  const config = {
    active: {
      label: activeLabel,
      variant: "default" as const,
      icon: CheckCircle2,
      className: "bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20",
    },
    inactive: {
      label: inactiveLabel,
      variant: "secondary" as const,
      icon: XCircle,
      className: "bg-gray-500/10 text-gray-700 dark:text-gray-400 hover:bg-gray-500/20",
    },
    pending: {
      label: "Pending",
      variant: "secondary" as const,
      icon: Clock,
      className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/20",
    },
    revoked: {
      label: "Revoked",
      variant: "destructive" as const,
      icon: XCircle,
      className: "bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-500/20",
    },
    expired: {
      label: "Expired",
      variant: "secondary" as const,
      icon: AlertCircle,
      className: "bg-orange-500/10 text-orange-700 dark:text-orange-400 hover:bg-orange-500/20",
    },
  }

  const { label, icon: Icon, className: statusClassName } = config[statusType]

  return (
    <Badge className={cn(statusClassName, className)}>
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {label}
    </Badge>
  )
}
