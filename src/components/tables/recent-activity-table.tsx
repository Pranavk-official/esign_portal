"use client";

import { format } from "date-fns";
import { useMemo } from "react";

import { Column, DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AuditLogRecord } from "@/lib/schemas/audit-log";

interface RecentActivityTableProps {
  activities: AuditLogRecord[];
  total: number;
  isLoading?: boolean;
  params: any;
  onParamsChange: (params: any) => void;
}

const formatDetails = (details: Record<string, any> | null): string => {
  if (!details) return "-";

  // Format common detail patterns
  if (details.old_values && details.new_values) {
    const changes = Object.keys(details.new_values).map(
      (key) => `${key}: ${details.old_values[key]} → ${details.new_values[key]}`
    );
    return changes.join(", ");
  }

  return JSON.stringify(details, null, 2);
};

const getEventBadgeVariant = (eventType: string): "default" | "secondary" | "outline" => {
  if (eventType.includes("create") || eventType.includes("add")) return "default";
  if (eventType.includes("delete") || eventType.includes("remove")) return "secondary";
  return "outline";
};

export function RecentActivityTable({
  activities,
  total,
  isLoading,
  params,
  onParamsChange,
}: RecentActivityTableProps) {
  const columns = useMemo<Column<AuditLogRecord>[]>(
    () => [
      {
        id: "event_type",
        header: "Event Type",
        cell: (row) => (
          <Badge
            variant={getEventBadgeVariant(row.event_type)}
            className="font-mono text-xs font-medium shadow-sm"
          >
            {row.event_type}
          </Badge>
        ),
      },
      {
        id: "details",
        header: "Details",
        cell: (row) => (
          <div className="max-w-md">
            <code className="text-xs whitespace-pre-wrap text-gray-600">
              {formatDetails(row.details)}
            </code>
          </div>
        ),
      },
      {
        id: "timestamp",
        header: "Timestamp",
        cell: (row) => (
          <span className="text-sm font-medium text-gray-700">
            {format(new Date(row.timestamp), "dd/MM/yyyy, HH:mm:ss")}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Filters - Mobile Optimized */}
      <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50/80 to-gray-50/40 p-3 shadow-sm backdrop-blur-sm sm:p-4">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-medium text-gray-600 sm:hidden">Event Type</label>
          <Select
            value={params.event_type || "all"}
            onValueChange={(value) =>
              onParamsChange({ ...params, event_type: value === "all" ? undefined : value, page: 1 })
            }
          >
            <SelectTrigger className="h-10 w-full bg-white text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500 sm:h-11 sm:w-[200px] sm:text-base">
              <SelectValue placeholder="All Events" />
            </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="profile:update">Profile Updates</SelectItem>
            <SelectItem value="user:login">Login Events</SelectItem>
            <SelectItem value="user:logout">Logout Events</SelectItem>
          </SelectContent>
        </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={activities}
        totalCount={total}
        isLoading={isLoading}
        emptyMessage="No recent activity found"
        page={params.page || 1}
        pageSize={params.page_size || 20}
        onPageChange={(page) => onParamsChange({ ...params, page })}
        onPageSizeChange={(page_size) => onParamsChange({ ...params, page_size, page: 1 })}
      />
    </div>
  );
}
