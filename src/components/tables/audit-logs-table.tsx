"use client";

import { format } from "date-fns";
import { useMemo } from "react";

import { Column, DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AuditLogRecord } from "@/lib/schemas/audit-log";

interface AuditLogsTableProps {
  logs: AuditLogRecord[];
  total: number;
  isLoading?: boolean;
  params: any;
  onParamsChange: (params: any) => void;
}

const formatDetails = (details: Record<string, any> | null): string => {
  if (!details) return "-";
  return JSON.stringify(details, null, 2);
};

export function AuditLogsTable({
  logs,
  total,
  isLoading,
  params,
  onParamsChange,
}: AuditLogsTableProps) {
  const columns = useMemo<Column<AuditLogRecord>[]>(
    () => [
      {
        id: "user_email",
        header: "User",
        cell: (row) => (
          <span className="text-sm font-medium text-gray-900">
            {row.user_email || row.user_id || "-"}
          </span>
        ),
      },
      {
        id: "event_type",
        header: "Action",
        cell: (row) => (
          <Badge variant="outline" className="font-mono text-xs font-medium shadow-sm">
            {row.event_type}
          </Badge>
        ),
      },
      {
        id: "resource_type",
        header: "Resource",
        cell: (row) => (
          <div className="text-sm">
            <div className="font-semibold text-gray-900">{row.resource_type || "-"}</div>
            {row.resource_id && (
              <div className="font-mono text-xs text-gray-500">
                {row.resource_id.slice(0, 8)}...
              </div>
            )}
          </div>
        ),
      },
      {
        id: "details",
        header: "Details",
        cell: (row) => (
          <div className="max-w-xs">
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
          <span className="text-sm text-gray-600">
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
        {/* Search - Full Width on Mobile */}
        <div className="mb-3 sm:mb-4">
          <Input
            placeholder="Search by user email or resource ID..."
            value={params.search || ""}
            onChange={(e) => onParamsChange({ ...params, search: e.target.value, page: 1 })}
            className="h-10 w-full bg-white text-sm shadow-sm transition-shadow focus:shadow-md sm:h-11 sm:max-w-md sm:text-base"
          />
        </div>

        {/* Filters - Stack on Mobile, Row on Desktop */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-medium text-gray-600 sm:hidden">Action</label>
            <Select
              value={params.event_type || "all"}
              onValueChange={(value) =>
                onParamsChange({
                  ...params,
                  event_type: value === "all" ? undefined : value,
                  page: 1,
                })
              }
            >
              <SelectTrigger className="h-10 w-full bg-white text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500 sm:h-11 sm:w-[180px] sm:text-base">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="portal:create">Create Portal</SelectItem>
              <SelectItem value="apikey:generate">Generate API Key</SelectItem>
              <SelectItem value="user:deactivate">Deactivate User</SelectItem>
            </SelectContent>
          </Select>
          </div>

          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-medium text-gray-600 sm:hidden">Resource</label>
            <Select
              value={params.resource_type || "all"}
              onValueChange={(value) =>
                onParamsChange({
                  ...params,
                  resource_type: value === "all" ? undefined : value,
                  page: 1,
                })
              }
            >
              <SelectTrigger className="h-10 w-full bg-white text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500 sm:h-11 sm:w-[180px] sm:text-base">
                <SelectValue placeholder="All Resources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                <SelectItem value="PORTAL">Portal</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="API_KEY">API Key</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        totalCount={total}
        isLoading={isLoading}
        emptyMessage="No audit logs found"
        page={params.page || 1}
        pageSize={params.page_size || 20}
        onPageChange={(page) => onParamsChange({ ...params, page })}
        onPageSizeChange={(page_size) => onParamsChange({ ...params, page_size, page: 1 })}
      />
    </div>
  );
}
