"use client";

import { format } from "date-fns";
import { Activity, Key, Settings, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PortalListResponse } from "@/lib/api/types";

interface PortalStatsCardsProps {
  portal: PortalListResponse;
  onEditKeyLimit?: () => void;
}

export function PortalStatsCards({ portal, onEditKeyLimit }: PortalStatsCardsProps) {
  return (
    <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">API Keys</CardTitle>
          <Key className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{portal.total_key_count || 0}</div>
          <p className="mt-1 text-xs text-gray-600">{portal.active_key_count || 0} active</p>
        </CardContent>
      </Card>

      <Card className="shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Users</CardTitle>
          <Users className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{portal.user_count || 0}</div>
          <p className="mt-1 text-xs text-gray-600">Total users</p>
        </CardContent>
      </Card>

      <Card className="shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Key Limit</CardTitle>
          <Settings className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {portal.max_keys || portal.live_key_limit || "∞"}
              </div>
              <p className="mt-1 text-xs text-gray-600">Maximum keys</p>
            </div>
            {onEditKeyLimit && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onEditKeyLimit}
                className="h-8 px-2 text-xs"
              >
                Edit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Created</CardTitle>
          <Activity className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-sm font-semibold">
            {format(new Date(portal.created_at), "MMM d, yyyy")}
          </div>
          <p className="mt-1 text-xs text-gray-600">
            {format(new Date(portal.created_at), "h:mm a")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
