"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";
import { useMemo } from "react";

import { TanstackTable } from "@/components/shared/tanstack-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDataTable } from "@/hooks/use-data-table";
import type { PortalListResponse } from "@/lib/api/types";

interface PortalTableProps {
  portals: PortalListResponse[];
  total: number;
  isLoading?: boolean;
  params: any;
  onParamsChange: (params: any) => void;
}

export function PortalTable({
  portals,
  total,
  isLoading,
  params,
  onParamsChange,
}: PortalTableProps) {
  const columns = useMemo<ColumnDef<PortalListResponse>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Portal Name",
        cell: ({ row }) => (
          <Link 
            href={`/admin/portals/${row.original.portal_id}`}
            className="flex flex-col gap-1 transition-colors hover:text-blue-600"
          >
            <span className="text-sm font-semibold text-gray-900 sm:text-base">
              {row.original.name}
            </span>
            <span className="text-xs text-gray-500 sm:text-sm">
              {row.original.portal_id}
            </span>
          </Link>
        ),
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => (
          <Badge 
            variant={row.original.is_active ? "default" : "secondary"}
            className="font-medium shadow-sm"
          >
            {row.original.is_active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "keys",
        header: "Keys",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <span className="text-green-600" title="Active Keys">
              {row.original.active_key_count}
            </span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700" title="Total Keys">{row.original.total_key_count}</span>
          </div>
        ),
      },
      {
        accessorKey: "user_count",
        header: "Users",
        cell: ({ row }) => (
          <span className="text-sm font-medium text-gray-700">{row.original.user_count}</span>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Created At",
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">
            {row.original.created_at
              ? format(new Date(row.original.created_at), "dd/MM/yyyy")
              : "-"}
          </span>
        ),
      },
    ],
    []
  );

  const { table } = useDataTable({
    columns,
    data: portals,
    totalCount: total,
    onParamsChange,
    initialParams: params,
  });

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Filters - Mobile Optimized */}
      <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50/80 to-gray-50/40 p-3 shadow-sm backdrop-blur-sm sm:p-4">
        {/* Search - Full Width on Mobile */}
        <div className="mb-3 sm:mb-4">
          <Input
            placeholder="Search portals..."
            value={params.search || ""}
            onChange={(e) => onParamsChange({ ...params, search: e.target.value, page: 1 })}
            className="h-10 w-full bg-white text-sm shadow-sm transition-shadow focus:shadow-md sm:h-11 sm:max-w-md sm:text-base"
          />
        </div>

        {/* Status Filter */}
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-medium text-gray-600 sm:hidden">Status</label>
          <Select
            value={
              params.is_active === undefined ? "all" : params.is_active ? "active" : "inactive"
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

      <TanstackTable
        table={table}
        totalCount={total}
        isLoading={isLoading}
        emptyMessage="No portals found"
      />
    </div>
  );
}
