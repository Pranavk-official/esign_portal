"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDataTable } from "@/hooks/use-data-table";
import type { ApiKeyResponse } from "@/lib/api/types";

interface ApiKeysTableProps {
  keys: ApiKeyResponse[];
  total: number;
  isLoading?: boolean;
  params: any;
  onParamsChange: (params: any) => void;
  onRevoke: (keyId: string) => void;
}

export function ApiKeysTable({
  keys,
  total,
  isLoading,
  params,
  onParamsChange,
  onRevoke,
}: ApiKeysTableProps) {
  const columns = useMemo<ColumnDef<ApiKeyResponse>[]>(
    () => [
      {
        accessorKey: "key_name",
        header: "Name",
        cell: ({ row }) => (
          <div className="font-medium text-gray-900">{row.original.key_name || "Unnamed Key"}</div>
        ),
      },
      {
        accessorKey: "key_prefix",
        header: "Prefix",
        cell: ({ row }) => (
          <code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs">
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
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
          <div className="flex flex-col text-xs">
            <span className="text-gray-900">
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
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRevoke(row.original.id)} className="text-red-600">
                Revoke Key
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [onRevoke]
  );

  const { table } = useDataTable({
    columns,
    data: keys,
    totalCount: total,
    onParamsChange,
    initialParams: params,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-100 bg-gray-50/50 p-4">
        <div className="flex items-center gap-4">
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
            <SelectTrigger className="w-[150px] bg-white">
              <SelectValue placeholder="All Environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Environment</SelectItem>
              <SelectItem value="LIVE">Live</SelectItem>
              <SelectItem value="TEST">Test</SelectItem>
            </SelectContent>
          </Select>

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
            <SelectTrigger className="w-[150px] bg-white">
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
        emptyMessage="No API keys found"
      />
    </div>
  );
}
