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
import type { PortalListResponse } from "@/types/portal"
import { format } from "date-fns"

interface PortalTableProps {
    portals: PortalListResponse[]
    total: number
    page: number
    pageSize: number
    totalPages: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
    onSearchChange: (search: string) => void
    onStatusFilter: (isActive: boolean | null) => void
    onSortChange: (sortBy: string, sortOrder: string) => void
}

export function PortalTable({
    portals,
    total,
    page,
    pageSize,
    totalPages,
    onPageChange,
    onPageSizeChange,
    onSearchChange,
    onStatusFilter,
    onSortChange,
}: PortalTableProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilterValue] = useState("all")
    const [sortBy, setSortBy] = useState("created_at")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

    const handleSearch = (value: string) => {
        setSearchTerm(value)
        onSearchChange(value)
    }

    const handleStatusFilter = (value: string) => {
        setStatusFilterValue(value)
        if (value === "all") {
            onStatusFilter(null)
        } else {
            onStatusFilter(value === "active")
        }
    }

    const handleSortChange = (by: string, order: "asc" | "desc") => {
        setSortBy(by)
        setSortOrder(order)
        onSortChange(by, order)
    }

    const tableData = portals.map(portal => ({
        ...portal,
        id: portal.portal_id // Map portal_id to id for DataTable
    }))

    const columns: ColumnDef<PortalListResponse & { id: string }>[] = [
        {
            header: "Portal Name",
            cell: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.name}</span>
                    <span className="text-xs text-muted-foreground">{row.portal_id}</span>
                </div>
            ),
        },
        {
            header: "Status",
            cell: (row) => (
                <Badge variant={row.is_active ? "default" : "secondary"}>
                    {row.is_active ? "Active" : "Inactive"}
                </Badge>
            ),
        },
        {
            header: "Keys",
            cell: (row) => (
                <div className="flex gap-2 text-sm">
                    <span title="Active Keys" className="text-green-600 font-medium">
                        {row.active_key_count}
                    </span>
                    <span className="text-muted-foreground">/</span>
                    <span title="Total Keys">{row.total_key_count}</span>
                </div>
            ),
        },
        {
            header: "Users",
            cell: (row) => (
                <span className="text-sm">{row.user_count}</span>
            ),
        },
        {
            header: "Created At",
            cell: (row) => (
                <span className="text-sm text-gray-600">
                    {format(new Date(row.created_at), "dd/MM/yyyy")}
                </span>
            ),
        },
        {
            header: "Actions",
            cell: () => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Manage Keys</DropdownMenuItem>
                        <DropdownMenuItem>Manage Users</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    const filters: FilterConfig[] = [
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
                    handleStatusFilter(value)
                }
            },
        },
        {
            type: "select",
            placeholder: "Sort By",
            value: sortBy,
            options: [
                { label: "Created Date", value: "created_at" },
                { label: "Name", value: "name" },
                { label: "Portal ID", value: "portal_id" },
            ],
            onChange: (value) => {
                if (typeof value === "string") {
                    handleSortChange(value, sortOrder)
                }
            },
        },
    ]

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Input
                    placeholder="Search portals..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <DataTable
                columns={columns}
                data={tableData}
                filters={filters}
                pagination={{
                    page,
                    pageSize,
                    total,
                    totalPages,
                    onPageChange,
                    onPageSizeChange,
                }}
                emptyMessage="No portals found"
            />
        </div>
    )
}
