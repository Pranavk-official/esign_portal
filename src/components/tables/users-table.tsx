"use client"

import { useMemo } from "react"
import { MoreHorizontal, Edit, Power, PowerOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ColumnDef } from "@tanstack/react-table"
import { TanstackTable } from "@/components/shared/tanstack-table"
import { useDataTable } from "@/hooks/use-data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import type { UserListResponse } from "@/lib/api/types"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface UsersTableProps {
    users: UserListResponse[]
    total: number
    isLoading?: boolean
    params: any
    onParamsChange: (params: any) => void
    selectedUsers?: string[]
    onSelectedUsersChange?: (users: string[]) => void
    onEdit?: (user: UserListResponse) => void
    onToggleStatus?: (user: UserListResponse) => void
}

const getInitials = (email: string): string => {
    if (!email) return "?"
    const parts = email.split("@")[0].split(".")
    return parts
        .slice(0, 2)
        .map((p) => (p && p[0]) || "")
        .join("")
        .toUpperCase()
}

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
    const columns = useMemo<ColumnDef<UserListResponse>[]>(() => [
        ...(onSelectedUsersChange
            ? [
                {
                    id: "select",
                    header: ({ table }: any) => (
                        <Checkbox
                            checked={table.getIsAllPageRowsSelected()}
                            onCheckedChange={(value) => {
                                table.toggleAllPageRowsSelected(!!value)
                                if (value) {
                                    onSelectedUsersChange(users.map((u) => u.id))
                                } else {
                                    onSelectedUsersChange([])
                                }
                            }}
                            aria-label="Select all"
                        />
                    ),
                    cell: ({ row }: any) => (
                        <Checkbox
                            checked={selectedUsers.includes(row.original.id)}
                            onCheckedChange={(value) => {
                                if (value) {
                                    onSelectedUsersChange([...selectedUsers, row.original.id])
                                } else {
                                    onSelectedUsersChange(
                                        selectedUsers.filter((id) => id !== row.original.id)
                                    )
                                }
                            }}
                            aria-label="Select row"
                        />
                    ),
                    enableSorting: false,
                    enableHiding: false,
                } as ColumnDef<UserListResponse>,
            ]
            : []),
        {
            accessorKey: "email",
            header: "User",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        {getInitials(row.original.email)}
                    </div>
                    <span className="text-sm">{row.original.email}</span>
                </div>
            ),
        },
        {
            accessorKey: "portal_id",
            header: "Portal",
            cell: ({ row }) => (
                <Badge variant="outline" className="text-xs">
                    {row.original.portal_id || "Global"}
                </Badge>
            ),
        },
        {
            id: "roles",
            header: "Roles",
            cell: ({ row }) => (
                <div className="flex gap-1 flex-wrap">
                    {row.original.roles?.map((role: any) => (
                        <Badge key={role.id} variant="secondary" className="text-xs">
                            {role.name.replace(/_/g, " ")}
                        </Badge>
                    ))}
                </div>
            ),
        },
        {
            accessorKey: "is_active",
            header: "Status",
            cell: ({ row }) => (
                <StatusBadge status={row.original.is_active} showIcon={true} />
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
                                    className={
                                        row.original.is_active
                                            ? "text-destructive"
                                            : "text-green-600"
                                    }
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
    ], [users, selectedUsers, onSelectedUsersChange, onEdit, onToggleStatus])

    const { table } = useDataTable({
        columns,
        data: users,
        totalCount: total,
        onParamsChange,
        initialParams: params,
    })

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4 bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                <div className="flex-1 min-w-[300px]">
                    <Input
                        placeholder="Search by email..."
                        value={params.search || ""}
                        onChange={(e) => onParamsChange({ ...params, search: e.target.value, page: 1 })}
                        className="max-w-md bg-white"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <Select
                        value={params.role_name || "all"}
                        onValueChange={(value) => onParamsChange({ ...params, role_name: value === "all" ? undefined : value, page: 1 })}
                    >
                        <SelectTrigger className="w-[150px] bg-white">
                            <SelectValue placeholder="All Roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                            <SelectItem value="portal_admin">Portal Admin</SelectItem>
                            <SelectItem value="portal_user">Portal User</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={params.is_active === undefined ? "all" : params.is_active ? "active" : "inactive"}
                        onValueChange={(value) => onParamsChange({
                            ...params,
                            is_active: value === "all" ? undefined : value === "active",
                            page: 1
                        })}
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
                emptyMessage="No users found"
            />
        </div>
    )
}

