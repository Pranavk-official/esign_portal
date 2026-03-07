"use client";

import { format } from "date-fns";
import { useMemo, useState } from "react";

import { ApiKeyDetailModal } from "@/app/(portal)/_components/portal-api-key-detail-modal";
import { Column, DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApiKeyResponse } from "@/lib/api/types";

interface PortalApiKeysTableProps {
  keys: ApiKeyResponse[];
  total: number;
  isLoading?: boolean;
  params: any;
  onParamsChange: (params: any) => void;
}

export function PortalApiKeysTable({
  keys,
  total,
  isLoading,
  params,
  onParamsChange,
}: PortalApiKeysTableProps) {
  // Store only the ID so the modal always receives the latest data from the
  // React Query cache rather than a stale snapshot captured at click time.
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const selectedKey = selectedKeyId ? (keys.find((k) => k.id === selectedKeyId) ?? null) : null;

  const columns = useMemo<Column<ApiKeyResponse>[]>(
    () => [
      {
        id: "key_name",
        header: "Name",
        cell: (row) => (
          <button
            onClick={() => setSelectedKeyId(row.id)}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
          >
            {row.key_name || "Unnamed Key"}
          </button>
        ),
      },
      {
        id: "key_prefix",
        header: "Prefix",
        cell: (row) => (
          <code className="inline-flex rounded-md bg-gray-100 px-2.5 py-1 font-mono text-xs font-medium text-gray-800 shadow-sm">
            {row.key_prefix}...
          </code>
        ),
      },
      {
        id: "environment",
        header: "Environment",
        cell: (row) => (
          <Badge
            variant={row.environment === "LIVE" ? "default" : "secondary"}
            className={
              row.environment === "LIVE"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 font-semibold text-white shadow-sm hover:from-blue-700 hover:to-blue-800"
                : "bg-gray-200 font-semibold text-gray-700 shadow-sm hover:bg-gray-300"
            }
          >
            {row.environment}
          </Badge>
        ),
      },
      {
        id: "limits",
        header: "Limits",
        cell: (row) => (
          <div className="flex flex-col gap-0.5 text-xs">
            <span className="font-semibold text-gray-900">
              {row.max_txn_count
                ? `${row.remaining_txn_count} / ${row.max_txn_count}`
                : "Unlimited"}
            </span>
            <span className="text-gray-500">transactions</span>
          </div>
        ),
      },
      {
        id: "last_used_at",
        header: "Last Used",
        cell: (row) => (
          <span className="text-sm">
            {row.last_used_at
              ? format(new Date(row.last_used_at), "dd/MM/yyyy HH:mm")
              : "Never"}
          </span>
        ),
      },
      {
        id: "is_active",
        header: "Status",
        cell: (row) => (
          <Badge variant={row.is_active ? "default" : "destructive"}>
            {row.is_active ? "Active" : "Revoked"}
          </Badge>
        ),
      },
    ],
    []
  );

  return (
    <>
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

        <DataTable
          columns={columns}
          data={keys}
          totalCount={total}
          isLoading={isLoading}
          emptyMessage="No API keys found"
          page={params.page || 1}
          pageSize={params.page_size || 20}
          onPageChange={(page) => onParamsChange({ ...params, page })}
          onPageSizeChange={(page_size) => onParamsChange({ ...params, page_size, page: 1 })}
        />
      </div>

      {selectedKeyId && (
        <ApiKeyDetailModal
          apiKey={selectedKey}
          open={!!selectedKeyId}
          onClose={() => setSelectedKeyId(null)}
        />
      )}
    </>
  );
}
