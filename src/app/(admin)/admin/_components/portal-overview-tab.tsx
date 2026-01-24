"use client";

import { format } from "date-fns";
import { Activity, TrendingUp } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ApiUsageSummary, PortalListResponse } from "@/lib/api/types";

interface PortalOverviewTabProps {
  portal: PortalListResponse;
  usageData?: ApiUsageSummary;
}

export function PortalOverviewTab({ portal, usageData }: PortalOverviewTabProps) {
  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Portal Information</CardTitle>
          <CardDescription>Basic details about this portal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-sm font-medium text-gray-600">Portal ID</div>
              <div className="mt-1 font-mono text-sm text-gray-900">{portal.portal_id}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Portal Name</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">{portal.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Status</div>
              <div className="mt-1">
                <StatusBadge status={portal.is_active} showIcon={true} />
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Environment</div>
              <div className="mt-1">
                <Badge variant="outline" className="font-medium shadow-sm">
                  {portal.environment || "Not set"}
                </Badge>
              </div>
            </div>
            {portal.description && (
              <div className="sm:col-span-2">
                <div className="text-sm font-medium text-gray-600">Description</div>
                <div className="mt-1 text-sm text-gray-700">{portal.description}</div>
              </div>
            )}
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-sm font-medium text-gray-600">Created At</div>
              <div className="mt-1 text-sm text-gray-900">
                {format(new Date(portal.created_at), "PPpp")}
              </div>
            </div>
            {portal.updated_at && (
              <div>
                <div className="text-sm font-medium text-gray-600">Last Updated</div>
                <div className="mt-1 text-sm text-gray-900">
                  {format(new Date(portal.updated_at), "PPpp")}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {usageData && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Usage Summary</CardTitle>
            <CardDescription>API usage statistics for this portal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <div className="text-xs font-medium text-gray-600">Total</div>
                </div>
                <div className="mt-2 text-2xl font-bold text-gray-900">
                  {usageData.total_transactions}
                </div>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50/50 p-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-600" />
                  <div className="text-xs font-medium text-gray-600">Completed</div>
                </div>
                <div className="mt-2 text-2xl font-bold text-green-700">{usageData.completed}</div>
              </div>
              <div className="rounded-lg border border-yellow-200 bg-yellow-50/50 p-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-yellow-600" />
                  <div className="text-xs font-medium text-gray-600">Pending</div>
                </div>
                <div className="mt-2 text-2xl font-bold text-yellow-700">{usageData.pending}</div>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50/50 p-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-red-600" />
                  <div className="text-xs font-medium text-gray-600">Failed</div>
                </div>
                <div className="mt-2 text-2xl font-bold text-red-700">{usageData.failed}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
