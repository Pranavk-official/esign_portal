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
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-xs font-bold text-white shadow-sm sm:h-10 sm:w-10">
              {getInitials(row.email)}
            </div>
            <span className="truncate text-sm text-gray-900 sm:text-base">{row.email}</span>
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
                className="h-9 w-9 touch-manipulation transition-all hover:bg-gray-100 active:scale-95 sm:h-10 sm:w-10"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(row)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Roles
                </DropdownMenuItem>
              )}
              {onToggleStatus && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onToggleStatus(row)}
                    className={row.is_active ? "text-destructive" : "text-green-600"}
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
      <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50/80 to-gray-50/40 p-3 shadow-sm backdrop-blur-sm sm:p-4">
        {/* Search - Full Width on Mobile */}
        <div className="mb-3 sm:mb-4">
          <Input
            placeholder="Search by email..."
            value={params.search || ""}
            onChange={(e) => onParamsChange({ ...params, search: e.target.value, page: 1 })}
            className="h-10 w-full bg-white text-sm shadow-sm transition-shadow focus:shadow-md sm:h-11 sm:max-w-md sm:text-base"
          />
        </div>

        {/* Filters - Stack on Mobile, Row on Desktop */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-medium text-gray-600 sm:hidden">Role</label>
            <Select
              value={params.role_name || "all"}
              onValueChange={(value) =>
                onParamsChange({ ...params, role_name: value === "all" ? undefined : value, page: 1 })
              }
            >
              <SelectTrigger className="h-10 w-full bg-white text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500 sm:h-11 sm:w-[160px] sm:text-base">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="portal_admin">Portal Admin</SelectItem>
                <SelectItem value="portal_user">Portal User</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
