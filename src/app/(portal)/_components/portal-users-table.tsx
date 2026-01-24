"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Edit, MoreHorizontal, Power, PowerOff, Shield, User } from "lucide-react";
import { useMemo } from "react";

import { StatusBadge } from "@/components/shared/status-badge";
import { TanstackTable } from "@/components/shared/tanstack-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import type { UserListResponse } from "@/lib/api/types";

interface PortalUsersTableProps {
  users: UserListResponse[];
  total: number;
  isLoading?: boolean;
  params: any;
  onParamsChange: (params: any) => void;
  onEdit?: (user: UserListResponse) => void;
  onToggleStatus?: (user: UserListResponse) => void;
}

const getInitials = (email: string): string => {
  if (!email) return "?";
  const parts = email.split("@")[0].split(".");
  return parts
    .slice(0, 2)
    .map((p) => (p && p[0]) || "")
    .join("")
    .toUpperCase();
};

const formatRoleName = (roleName: string): string => {
  const formatted = roleName.replace(/_/g, " ");
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const getRoleIcon = (roleName: string) => {
  if (roleName === "portal_admin") return Shield;
  return User;
};

const getRoleColor = (roleName: string): string => {
  if (roleName === "portal_admin") return "bg-purple-100 text-purple-700 border-purple-200";
  return "bg-blue-100 text-blue-700 border-blue-200";
};

export function PortalUsersTable({
  users,
  total,
  isLoading,
  params,
  onParamsChange,
  onEdit,
  onToggleStatus,
}: PortalUsersTableProps) {
  const columns = useMemo<ColumnDef<UserListResponse>[]>(
    () => [
      {
        accessorKey: "email",
        header: "Team Member",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-bold text-white shadow-sm">
              {getInitials(row.original.email)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{row.original.email}</span>
              <span className="text-xs text-muted-foreground">
                {row.original.role_names?.[0]
                  ? formatRoleName(row.original.role_names[0])
                  : "No role"}
              </span>
            </div>
          </div>
        ),
      },
      {
        id: "roles",
        header: "Roles & Permissions",
        cell: ({ row }) => {
          const roleNames = row.original.role_names?.filter(
            (role) => role === "portal_admin" || role === "portal_user"
          );

          if (!roleNames || roleNames.length === 0) {
            return (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                No roles assigned
              </Badge>
            );
          }

          return (
            <div className="flex flex-wrap gap-1.5">
              {roleNames.map((roleName, index) => {
                const RoleIcon = getRoleIcon(roleName);
                return (
                  <Badge
                    key={index}
                    className={`flex items-center gap-1 border text-xs font-medium ${getRoleColor(roleName)}`}
                    variant="outline"
                  >
                    <RoleIcon className="h-3 w-3" />
                    {formatRoleName(roleName)}
                  </Badge>
                );
              })}
            </div>
          );
        },
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.is_active} showIcon={true} />,
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
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(row.original)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Roles
                </DropdownMenuItem>
              )}
              {onToggleStatus && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onToggleStatus(row.original)}
                    className={row.original.is_active ? "text-destructive" : "text-green-600"}
                  >
                    {row.original.is_active ? (
                      <>
                        <PowerOff className="mr-2 h-4 w-4" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Power className="mr-2 h-4 w-4" />
                        Activate
                      </>
                    )}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [onEdit, onToggleStatus]
  );

  const { table } = useDataTable({
    columns,
    data: users,
    totalCount: total,
    onParamsChange,
    initialParams: params,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4 shadow-sm">
        <div className="min-w-[300px] flex-1">
          <Input
            placeholder="Search team members by email..."
            value={params.search || ""}
            onChange={(e) => onParamsChange({ ...params, search: e.target.value, page: 1 })}
            className="max-w-md border-gray-200 bg-white shadow-sm"
          />
        </div>

        <div className="flex items-center gap-4">
          <Select
            value={params.role_name || "all"}
            onValueChange={(value) =>
              onParamsChange({ ...params, role_name: value === "all" ? undefined : value, page: 1 })
            }
          >
            <SelectTrigger className="w-[160px] border-gray-200 bg-white shadow-sm">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="portal_admin">Portal Admin</SelectItem>
              <SelectItem value="portal_user">Portal User</SelectItem>
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
            <SelectTrigger className="w-[140px] border-gray-200 bg-white shadow-sm">
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
        emptyMessage="No team members found. Add your first team member to get started."
      />
    </div>
  );
}
