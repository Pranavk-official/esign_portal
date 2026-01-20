"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface BulkActionToolbarProps {
  selectedCount: number
  totalCount: number
  onClear: () => void
  actions: Array<{
    label: string
    icon?: React.ComponentType<{ className?: string }>
    onClick: () => void
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    disabled?: boolean
  }>
  className?: string
}

export function BulkActionToolbar({
  selectedCount,
  totalCount,
  onClear,
  actions,
  className,
}: BulkActionToolbarProps) {
  if (selectedCount === 0) return null

  return (
    <div className={`flex items-center gap-4 p-4 bg-muted/50 border rounded-lg ${className}`}>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="font-mono">
          {selectedCount} / {totalCount}
        </Badge>
        <span className="text-sm text-muted-foreground">selected</span>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-2 flex-1">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || "outline"}
            size="sm"
            onClick={action.onClick}
            disabled={action.disabled}
          >
            {action.icon && <action.icon className="mr-2 h-4 w-4" />}
            {action.label}
          </Button>
        ))}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        className="ml-auto"
      >
        <X className="mr-2 h-4 w-4" />
        Clear
      </Button>
    </div>
  )
}
