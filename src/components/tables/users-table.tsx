"use client"

import { useState } from "react"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DataTable, type ColumnDef, type FilterConfig } from "@/components/shared/data-table"
import type { UserListResponse } from "@/types/user"

interface UsersTableProps {
    users: UserListResponse[]
    total: number
    page: number
    pageSize: number
    totalPages: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
    onSearchChange: (search: string) => void
    onRoleFilter: (role: string) => void
    onStatusFilter: (status: string) => void
    onSortChange: (sortBy: string, sortOrder: string) => void
}

const getInitials = (email: string): string => {
    const parts = email.split("@")[0].split(".")
    return parts
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase()
}

export function UsersTable({
    users,
    total,
    page,
    pageSize,
    totalPages,
    onPageChange,
    onPageSizeChange,
    onSearchChange,
    onRoleFilter,
    onStatusFilter,
    onSortChange,
}: UsersTableProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [roleFilter, setRoleFilterValue] = useState("all")
    const [statusFilter, setStatusFilterValue] = useState("all")
    const [sortBy, setSortBy] = useState("created_at")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

    const handleSearch = (value: string) => {
        setSearchTerm(value)
        onSearchChange(value)
    }

    const handleRoleFilterChange = (role: string) => {
        setRoleFilterValue(role)
        onRoleFilter(role)
    }

    const handleStatusFilterChange = (status: string) => {
        setStatusFilterValue(status)
        onStatusFilter(status)
    }

    const handleSortChange = (by: string, order: "asc" | "desc") => {
        setSortBy(by)
        setSortOrder(order)
        onSortChange(by, order)
    }

    const columns: ColumnDef<UserListResponse>[] = [
        {
            header: "User",
            width: "300px",
            cell: (row) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        {getInitials(row.email)}
                    </div>
                    <span className="text-sm">{row.email}</span>
                </div>
            ),
        },
        {
            header: "Portal",
            cell: (row) => (
                <Badge variant="outline" className="text-xs">
                    {row.portal_id || "Global"}
                </Badge>
            ),
        },
        {
            header: "Roles",
            cell: (row) => (
                <div className="flex gap-1 flex-wrap">
                    {row.roles.map((role) => (
                        <Badge key={role.id} variant="secondary" className="text-xs">
                            {role.name.replace("_", " ")}
                        </Badge>
                    ))}
                </div>
            ),
        },
        {
            header: "Status",
            cell: (row) => (
                <Badge variant={row.is_active ? "default" : "secondary"} className="text-xs">
                    {row.is_active ? "Active" : "Inactive"}
                </Badge>
            ),
        },
        {
            header: "Actions",
            cell: (row) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>
                            {row.is_active ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    const filters: FilterConfig[] = [
        {
            type: "select",
            placeholder: "All Roles",
            value: roleFilter,
            options: [
                { label: "All Roles", value: "all" },
                { label: "Super Admin", value: "super_admin" },
                { label: "Portal Admin", value: "portal_admin" },
                { label: "Portal User", value: "portal_user" },
            ],
            onChange: (value) => {
                if (typeof value === "string") {
                    handleRoleFilterChange(value)
                }
            },
        },
        {
            type: "select",
            placeholder: "All Status",
            value: statusFilter,
            options: [
                { label: "All Status", value: "all" },
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
            ],
            onChange: (value) => {
                if (typeof value === "string") {
                    handleStatusFilterChange(value)
                }
            },
        },
        {
            type: "select",
            placeholder: "Created Date",
            value: sortBy,
            options: [
                { label: "Created Date", value: "created_at" },
                { label: "Email", value: "email" },
                { label: "Status", value: "is_active" },
            ],
            onChange: (value) => {
                if (typeof value === "string") {
                    handleSortChange(value, sortOrder)
                }
            },
        },
        {
            type: "select",
            placeholder: "Descending",
            value: sortOrder,
            options: [
                { label: "Ascending", value: "asc" },
                { label: "Descending", value: "desc" },
            ],
            onChange: (value) => {
                if (typeof value === "string") {
                    handleSortChange(sortBy, value as "asc" | "desc")
                }
            },
        },
    ]

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <Input
                placeholder="Search by e-mail or user ID..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="max-w-md"
            />

            {/* DataTable with filters */}
            <DataTable
                columns={columns}
                data={users}
                filters={filters}
                pagination={{
                    page,
                    pageSize,
                    total,
                    totalPages,
                    onPageChange,
                    onPageSizeChange,
                }}
                emptyMessage="No users found"
            />
        </div>
    )
}
