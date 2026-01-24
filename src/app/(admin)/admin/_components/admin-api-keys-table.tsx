"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useMemo } from "react";

import { TanstackTable } from "@/components/shared/tanstack-table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDataTable } from "@/hooks/use-data-table";
import type { ApiKeyResponse } from "@/lib/api/types";

interface AdminApiKeysTableProps {
  keys: ApiKeyResponse[];
  total: number;
  isLoading?: boolean;
  params: any;
  onParamsChange: (params: any) => void;
  onViewKey: (key: ApiKeyResponse) => void;
}

export function AdminApiKeysTable({
  keys,
  total,
  isLoading,
  params,
  onParamsChange,
  onViewKey,
}: AdminApiKeysTableProps) {
  const columns = useMemo<ColumnDef<ApiKeyResponse>[]>(
    () => [
      {
        accessorKey: "key_name",
        header: "Name",
        cell: ({ row }) => (
          <button
            onClick={() => onViewKey(row.original)}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
          >
            {row.original.key_name || "Unnamed Key"}
          </button>
        ),
      },
      {
        accessorKey: "key_prefix",
        header: "Prefix",
        cell: ({ row }) => (
          <code className="inline-flex rounded-md bg-gray-100 px-2.5 py-1 font-mono text-xs font-medium text-gray-800 shadow-sm">
            {row.original.key_prefix}...
          </code>
        ),
      },
      {
        accessorKey: "environment",
        header: "Environment",
        cell: ({ row }) => (
          <Badge
            variant={row.original.environment === "LIVE" ? "default" : "secondary"}
            className={
              row.original.environment === "LIVE"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 font-semibold text-white shadow-sm hover:from-blue-700 hover:to-blue-800"
                : "bg-gray-200 font-semibold text-gray-700 shadow-sm hover:bg-gray-300"
            }
          >
            {row.original.environment}
          </Badge>
        ),
      },
      {
        id: "limits",
        header: "Limits",
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5 text-xs">
            <span className="font-semibold text-gray-900">
              {row.original.max_txn_count
                ? `${row.original.remaining_txn_count} / ${row.original.max_txn_count}`
                : "Unlimited"}
            </span>
            <span className="text-gray-500">transactions</span>
          </div>
        ),
      },
      {
        accessorKey: "last_used_at",
        header: "Last Used",
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.last_used_at
              ? format(new Date(row.original.last_used_at), "dd/MM/yyyy HH:mm")
              : "Never"}
          </span>
        ),
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? "default" : "destructive"}>
            {row.original.is_active ? "Active" : "Revoked"}
          </Badge>
        ),
      },
    ],
    [onViewKey]
  );

  const { table } = useDataTable({
    columns,
    data: keys,
    totalCount: total,
    onParamsChange,
    initialParams: params,
  });

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Filters - Mobile Optimized */}
      <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50/80 to-gray-50/40 p-3 shadow-sm backdrop-blur-sm sm:p-4">
        {/* Filters - Stack on Mobile, Row on Desktop */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-medium text-gray-600 sm:hidden">
              Environment
            </label>
            <Select
              value={params.environment || "all"}
              onValueChange={(value) =>
                onParamsChange({
                  ...params,
                  environment: value === "all" ? undefined : value,
                  page: 1,
                })
              }
            >
              <SelectTrigger className="h-10 w-full bg-white text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500 sm:h-11 sm:w-[160px] sm:text-base">
                <SelectValue placeholder="All Environment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Environment</SelectItem>
                <SelectItem value="LIVE">Live</SelectItem>
                <SelectItem value="TEST">Test</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-medium text-gray-600 sm:hidden">
              Status
            </label>
            <Select
              value={
                params.is_active === undefined
                  ? "all"
                  : params.is_active
                    ? "active"
                    : "inactive"
              }
              onValueChange={(value) =>
                onParamsChange({
                  ...params,
                  is_active: value === "all" ? undefined : value === "active",
                  page: 1,
                })
              }
            >
              <SelectTrigger className="h-10 w-full bg-white text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500 sm:h-11 sm:w-[160px] sm:text-base">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <TanstackTable
        table={table}
        totalCount={total}
        isLoading={isLoading}
        emptyMessage="No API keys found"
      />
    </div>
  );
}
