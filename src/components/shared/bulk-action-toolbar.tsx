"use client";

import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface BulkActionToolbarProps {
  selectedCount: number;
  totalCount: number;
  onClear: () => void;
  actions: Array<{
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    disabled?: boolean;
  }>;
  className?: string;
}

export function BulkActionToolbar({
  selectedCount,
  totalCount,
  onClear,
  actions,
  className,
}: BulkActionToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className={`bg-muted/50 flex items-center gap-4 rounded-lg border p-4 ${className}`}>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="font-mono">
          {selectedCount} / {totalCount}
        </Badge>
        <span className="text-muted-foreground text-sm">selected</span>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex flex-1 items-center gap-2">
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

      <Button variant="ghost" size="sm" onClick={onClear} className="ml-auto">
        <X className="mr-2 h-4 w-4" />
        Clear
      </Button>
    </div>
  );
}
