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
import type { ApiUsageRecord, TransactionStatus } from "@/types/api-usage"
import { format } from "date-fns"

interface ApiUsageTableProps {
    records: ApiUsageRecord[]
    total: number
    page: number
    pageSize: number
    totalPages: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
    onSearchChange: (search: string) => void
    onStatusFilter: (status: string) => void
    onDateFilter: (from: string, to: string) => void
    onSortChange: (sortBy: string, sortOrder: string) => void
}

const getStatusVariant = (status: TransactionStatus): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
        case "COMPLETED":
            return "default"
        case "FAILED":
            return "destructive"
        case "PENDING":
            return "secondary"
        default:
            return "outline"
    }
}

export function ApiUsageTable({
    records,
    total,
    page,
    pageSize,
    totalPages,
    onPageChange,
    onPageSizeChange,
    onSearchChange,
    onStatusFilter,
    onDateFilter,
    onSortChange,
}: ApiUsageTableProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilterValue] = useState("all")
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")
    const [sortBy, setSortBy] = useState("created_at")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

    const handleSearch = (value: string) => {
        setSearchTerm(value)
        onSearchChange(value)
    }

    const handleStatusFilter = (status: string) => {
        setStatusFilterValue(status)
        onStatusFilter(status)
    }

    const handleSortChange = (by: string, order: "asc" | "desc") => {
        setSortBy(by)
        setSortOrder(order)
        onSortChange(by, order)
    }

    const columns: ColumnDef<ApiUsageRecord>[] = [
        {
            header: "Gateway Txn ID",
            width: "150px",
            cell: (row) => (
                <span className="text-sm font-mono text-gray-700">
                    {row.gateway_txn_id}
                </span>
            ),
        },
        {
            header: "Portal",
            cell: (row) => (
                <Badge variant="outline" className="text-xs">
                    {row.portal_id}
                </Badge>
            ),
        },
        {
            header: "Status",
            cell: (row) => (
                <Badge variant={getStatusVariant(row.status)} className="text-xs">
                    {row.status}
                </Badge>
            ),
        },
        {
            header: "Auth Mode",
            cell: (row) => (
                <span className="text-sm text-gray-600">
                    {row.auth_mode || "-"}
                </span>
            ),
        },
        {
            header: "Created At",
            cell: (row) => (
                <span className="text-sm text-gray-600">
                    {format(new Date(row.created_at), "dd/MM/yyyy, HH:mm:ss")}
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
                        <DropdownMenuItem>Download</DropdownMenuItem>
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
                { label: "Completed", value: "COMPLETED" },
                { label: "Failed", value: "FAILED" },
                { label: "Pending", value: "PENDING" },
                { label: "Cancelled", value: "USER_CANCELLED" },
            ],
            onChange: (value) => {
                if (typeof value === "string") {
                    handleStatusFilter(value)
                }
            },
        },
        {
            type: "select",
            placeholder: "Created Date",
            value: sortBy,
            options: [
                { label: "Created Date", value: "created_at" },
                { label: "Updated Date", value: "updated_at" },
                { label: "Status", value: "status" },
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
            {/* Search and Date Filters */}
            <div className="flex items-center gap-4">
                <Input
                    placeholder="Search by txn ID, doc ID, or file hash..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="max-w-md"
                />

                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">From:</span>
                    <Input
                        type="date"
                        value={fromDate}
                        onChange={(e) => {
                            setFromDate(e.target.value)
                            if (toDate) onDateFilter(e.target.value, toDate)
                        }}
                        className="w-[150px]"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">To:</span>
                    <Input
                        type="date"
                        value={toDate}
                        onChange={(e) => {
                            setToDate(e.target.value)
                            if (fromDate) onDateFilter(fromDate, e.target.value)
                        }}
                        className="w-[150px]"
                    />
                </div>
            </div>

            {/* DataTable with filters */}
            <DataTable
                columns={columns}
                data={records}
                filters={filters}
                pagination={{
                    page,
                    pageSize,
                    total,
                    totalPages,
                    onPageChange,
                    onPageSizeChange,
                }}
                emptyMessage="No API usage records found"
            />
        </div>
    )
}
