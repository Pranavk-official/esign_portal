"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { PortalStatisticsModal } from "@/components/shared/portal-statistics-modal";
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
  const [selectedPortal, setSelectedPortal] = useState<PortalListResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (portal: PortalListResponse) => {
    setSelectedPortal(portal);
    setIsModalOpen(true);
  };

  const columns = useMemo<ColumnDef<PortalListResponse>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Portal Name",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name}</span>
            <span className="text-muted-foreground text-xs">{row.original.portal_id}</span>
          </div>
        ),
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? "default" : "secondary"}>
            {row.original.is_active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "keys",
        header: "Keys",
        cell: ({ row }) => (
          <div className="flex gap-2 text-sm">
            <span title="Active Keys" className="font-medium text-green-600">
              {row.original.active_key_count}
            </span>
            <span className="text-muted-foreground">/</span>
            <span title="Total Keys">{row.original.total_key_count}</span>
          </div>
        ),
      },
      {
        accessorKey: "user_count",
        header: "Users",
        cell: ({ row }) => <span className="text-sm">{row.original.user_count}</span>,
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
              <DropdownMenuItem onClick={() => handleViewDetails(row.original)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>Manage Keys</DropdownMenuItem>
              <DropdownMenuItem>Manage Users</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-100 bg-gray-50/50 p-4">
        <div className="min-w-[300px] flex-1">
          <Input
            placeholder="Search portals..."
            value={params.search || ""}
            onChange={(e) => onParamsChange({ ...params, search: e.target.value, page: 1 })}
            className="max-w-md bg-white"
          />
        </div>

        <div className="flex items-center gap-4">
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
        emptyMessage="No portals found"
      />

      <PortalStatisticsModal
        portal={selectedPortal}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
