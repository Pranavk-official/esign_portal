"use client";

import { ArrowLeft, Power, PowerOff, Shield } from "lucide-react";
import Link from "next/link";

import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import type { PortalListResponse } from "@/lib/api/types";

interface PortalHeaderProps {
  portal: PortalListResponse;
  onToggleStatus: () => void;
}

export function PortalHeader({ portal, onToggleStatus }: PortalHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 sm:gap-4">
        <Link href="/admin/portals">
          <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-sm sm:h-12 sm:w-12">
          <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">{portal.name}</h1>
          <p className="text-xs text-gray-600 sm:text-sm">{portal.portal_id}</p>
        </div>
        <StatusBadge status={portal.is_active} showIcon={true} />
      </div>
      <Button
        variant={portal.is_active ? "destructive" : "default"}
        size="sm"
        className="w-full touch-manipulation sm:w-auto"
        onClick={onToggleStatus}
      >
        {portal.is_active ? (
          <>
            <PowerOff className="mr-2 h-4 w-4" />
            Deactivate Portal
          </>
        ) : (
          <>
            <Power className="mr-2 h-4 w-4" />
            Activate Portal
          </>
        )}
      </Button>
    </div>
  );
}
