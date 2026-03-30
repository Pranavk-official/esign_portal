"use client";

import { Edit, MoreHorizontal, Power, PowerOff } from "lucide-react";
import { useMemo } from "react";

import { Column, DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { UserListResponse } from "@/lib/api/types";

interface UsersTableProps {
  users: UserListResponse[];
  total: number;
  isLoading?: boolean;
  params: any;
  onParamsChange: (params: any) => void;
  selectedUsers?: string[];
  onSelectedUsersChange?: (users: string[]) => void;
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

export function UsersTable({
  users,
  total,
  isLoading,
  params,
  onParamsChange,
  selectedUsers = [],
  onSelectedUsersChange,
  onEdit,
  onToggleStatus,
}: UsersTableProps) {
  const allSelected = users.length > 0 && selectedUsers.length === users.length;

  const columns = useMemo<Column<UserListResponse>[]>(
    () => [
      ...(onSelectedUsersChange
        ? [
            {
              id: "select",
              header: (
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(value) => {
                    if (value) {
                      onSelectedUsersChange(users.map((u) => u.id));
                    } else {
                      onSelectedUsersChange([]);
                    }
                  }}
                  aria-label="Select all"
                />
              ),
              cell: (row: UserListResponse) => (
                <Checkbox
                  checked={selectedUsers.includes(row.id)}
                  onCheckedChange={(value) => {
                    if (value) {
                      onSelectedUsersChange([...selectedUsers, row.id]);
                    } else {
                      onSelectedUsersChange(selectedUsers.filter((id) => id !== row.id));
                    }
                  }}
                  aria-label="Select row"
                />
              ),
            } as Column<UserListResponse>,
          ]
        : []),
      {
        id: "email",
        header: "User",
        cell: (row) => (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 text-xs font-bold text-white shadow-sm sm:h-10 sm:w-10 transition-all group-hover:shadow-indigo-400/30">
              {getInitials(row.email)}
            </div>
            <span className="truncate text-sm text-foreground sm:text-base font-medium">{row.email}</span>
          </div>
        ),
      },
      {
        id: "portal_id",
        header: "Portal",
        cell: (row) => (
          <Badge variant="outline" className="text-xs font-medium shadow-sm">
            {row.portal_id || "Global"}
          </Badge>
        ),
      },
      {
        id: "roles",
        header: "Roles",
        cell: (row) => {
          const roleNames = row.role_names;
          
          if (!roleNames || roleNames.length === 0) {
            return <span className="text-xs text-muted-foreground">No roles</span>;
          }

          return (
            <div className="flex flex-wrap gap-1">
              {roleNames.map((roleName, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {roleName.replace(/_/g, " ")}
                </Badge>
              ))}
            </div>
          );
        },
      },
      {
        id: "is_active",
        header: "Status",
        cell: (row) => <StatusBadge status={row.is_active} showIcon={true} />,
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: (row) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9 touch-manipulation transition-all hover:bg-indigo-100 hover:text-indigo-600 active:scale-95 sm:h-10 sm:w-10"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 backdrop-blur-sm bg-background/95 border-border">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(row)} className="cursor-pointer hover:bg-indigo-100 hover:text-indigo-600 transition-colors">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Roles
                </DropdownMenuItem>
              )}
              {onToggleStatus && (
                <>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    onClick={() => onToggleStatus(row)}
                    className={`cursor-pointer transition-colors ${
                      row.is_active
                        ? "hover:bg-red-100 hover:text-red-600"
                        : "hover:bg-indigo-100 hover:text-indigo-600"
                    }`}
                  >
                    {row.is_active ? (
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
    [users, selectedUsers, onSelectedUsersChange, onEdit, onToggleStatus, allSelected]
  );

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Filters - Mobile Optimized */}
      <div className="rounded-lg border border-indigo-200 bg-gradient-to-br from-card/60 to-card/30 p-3 shadow-sm backdrop-blur-sm sm:p-4 transition-all hover:border-indigo-300">
        {/* Search - Full Width on Mobile */}
        <div className="mb-3 sm:mb-4">
          <Input
            placeholder="Search by email..."
            value={params.search || ""}
            onChange={(e) => onParamsChange({ ...params, search: e.target.value, page: 1 })}
            className="h-10 w-full bg-background/80 text-sm shadow-sm transition-all focus:shadow-lg focus:ring-2 focus:ring-indigo-400/50 sm:h-11 sm:max-w-md sm:text-base border-indigo-200 hover:border-indigo-300"
          />
        </div>

        {/* Filters - Stack on Mobile, Row on Desktop */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground sm:hidden">Role</label>
            <Select
              value={params.role_name || "all"}
              onValueChange={(value) =>
                onParamsChange({ ...params, role_name: value === "all" ? undefined : value, page: 1 })
              }
            >
              <SelectTrigger className="h-10 w-full bg-background/80 text-sm shadow-sm transition-all focus:ring-2 focus:ring-indigo-400/50 sm:h-11 sm:w-[160px] sm:text-base border-indigo-200 hover:border-indigo-300">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent className="border-border bg-background/95 backdrop-blur-sm">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="portal_admin">Portal Admin</SelectItem>
                <SelectItem value="portal_user">Portal User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground sm:hidden">Status</label>
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
              <SelectTrigger className="h-10 w-full bg-background/80 text-sm shadow-sm transition-all focus:ring-2 focus:ring-indigo-400/50 sm:h-11 sm:w-[160px] sm:text-base border-indigo-200 hover:border-indigo-300">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="border-border bg-background/95 backdrop-blur-sm">
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
        data={users}
        totalCount={total}
        isLoading={isLoading}
        emptyMessage="No users found"
        page={params.page || 1}
        pageSize={params.page_size || 20}
        onPageChange={(page) => onParamsChange({ ...params, page })}
        onPageSizeChange={(pageSize) => onParamsChange({ ...params, page_size: pageSize, page: 1 })}
      />
    </div>
  );
}
