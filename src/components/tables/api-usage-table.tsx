"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal, X } from "lucide-react";
import { useMemo } from "react";

import { TanstackTable } from "@/components/shared/tanstack-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDataTable } from "@/hooks/use-data-table";
import { ApiUsageRecord } from "@/lib/api/usage";

interface ApiUsageTableProps {
  records: ApiUsageRecord[];
  total: number;
  isLoading?: boolean;
  params: any;
  onParamsChange: (params: any) => void;
}

const getStatusVariant = (status: string): "default" | "destructive" | "secondary" | "outline" => {
  switch (status) {
    case "COMPLETED":
      return "default";
    case "FAILED":
      return "destructive";
    case "PENDING":
      return "secondary";
    default:
      return "outline";
  }
};

export function ApiUsageTable({
  records,
  total,
  isLoading,
  params,
  onParamsChange,
}: ApiUsageTableProps) {
  const columns = useMemo<ColumnDef<ApiUsageRecord>[]>(
    () => [
      {
        accessorKey: "gateway_txn_id",
        header: "Transaction ID",
        cell: ({ row }) => (
          <div className="flex flex-col gap-1 min-w-[180px] max-w-[250px]">
            <span className="font-mono text-xs sm:text-sm text-gray-700 truncate" title={row.original.gateway_txn_id}>
              {row.original.gateway_txn_id}
            </span>
            {/* Show portal and status on mobile */}
            <div className="flex items-center gap-2 sm:hidden">
              <Badge variant="outline" className="text-[10px] px-1 py-0">
                {row.original.portal_id}
              </Badge>
              <Badge variant={getStatusVariant(row.original.status)} className="text-[10px] px-1 py-0">
                {row.original.status}
              </Badge>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "portal_id",
        header: "Portal / Key",
        cell: ({ row }) => (
          <div className="flex flex-col gap-1.5 min-w-[140px]">
            <Badge variant="outline" className="w-fit text-xs px-2 py-0.5">
              {row.original.portal_id}
            </Badge>
            {row.original.api_key_name && (
              <span className="text-muted-foreground text-xs truncate max-w-[160px]" title={`API Key: ${row.original.api_key_name}`}>
                Key: {row.original.api_key_name}
              </span>
            )}
          </div>
        ),
        meta: {
          className: "hidden sm:table-cell",
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={getStatusVariant(row.original.status)} className="text-xs whitespace-nowrap">
            {row.original.status}
          </Badge>
        ),
        meta: {
          className: "hidden sm:table-cell",
        },
      },
      {
        accessorKey: "auth_mode",
        header: "Auth Mode",
        cell: ({ row }) => (
          <span className="text-sm text-gray-600 whitespace-nowrap">{row.original.auth_mode || "-"}</span>
        ),
        meta: {
          className: "hidden lg:table-cell",
        },
      },
      {
        accessorKey: "created_at",
        header: "Created At",
        cell: ({ row }) => (
          <div className="flex flex-col min-w-[120px]">
            <span className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">
              {row.original.created_at
                ? format(new Date(row.original.created_at), "dd/MM/yyyy")
                : "-"}
            </span>
            <span className="text-[10px] sm:text-xs text-gray-500">
              {row.original.created_at
                ? format(new Date(row.original.created_at), "HH:mm:ss")
                : ""}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: () => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Download</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        meta: {
          className: "w-[50px]",
        },
      },
    ],
    []
  );

  const { table } = useDataTable({
    columns,
    data: records,
    totalCount: total,
    onParamsChange,
    initialParams: params,
  });

  const hasActiveFilters = params.status || params.start_date || params.end_date;

  const clearFilters = () => {
    onParamsChange({
      ...params,
      status: undefined,
      start_date: undefined,
      end_date: undefined,
      page: 1,
    });
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Filters Section - Optimized for Mobile */}
      <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 sm:p-4">
        {/* Search Input - Full Width on Mobile */}
        <div className="mb-3 sm:mb-4">
          <Input
            placeholder="Search by txn ID, doc ID, or file hash..."
            value={params.search || ""}
            onChange={(e) => onParamsChange({ ...params, search: e.target.value, page: 1 })}
            className="w-full bg-white text-sm sm:text-base h-9 sm:h-10"
          />
        </div>

        {/* Filter Controls - Stack on Mobile, Inline on Desktop */}
        <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
          {/* Status Filter */}
          <div className="w-full sm:w-auto">
            <label className="text-xs text-gray-600 mb-1.5 block sm:hidden">Status</label>
            <Select
              value={params.status || "all"}
              onValueChange={(value) =>
                onParamsChange({ ...params, status: value === "all" ? undefined : value, page: 1 })
              }
            >
              <SelectTrigger className="w-full sm:w-[140px] lg:w-[150px] bg-white h-9 text-sm">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="USER_CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filters */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
            {/* Start Date */}
            <div className="flex-1 sm:flex-none">
              <label className="text-xs text-gray-600 mb-1.5 block">From</label>
              <Input
                type="date"
                value={params.start_date || ""}
                onChange={(e) => onParamsChange({ ...params, start_date: e.target.value, page: 1 })}
                className="w-full sm:w-[140px] lg:w-[150px] bg-white h-9 text-sm"
              />
            </div>

            {/* End Date */}
            <div className="flex-1 sm:flex-none">
              <label className="text-xs text-gray-600 mb-1.5 block">To</label>
              <Input
                type="date"
                value={params.end_date || ""}
                onChange={(e) => onParamsChange({ ...params, end_date: e.target.value, page: 1 })}
                className="w-full sm:w-[140px] lg:w-[150px] bg-white h-9 text-sm"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="w-full sm:w-auto h-9 text-sm sm:ml-auto"
            >
              <X className="h-3.5 w-3.5 mr-1.5" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Table with Horizontal Scroll on Mobile */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
          <TanstackTable
            table={table}
            totalCount={total}
            isLoading={isLoading}
            emptyMessage="No API usage records found"
          />
        </div>
      </div>
    </div>
  );
}
