"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DataTable, type ColumnDef, type FilterConfig } from "@/components/shared/data-table"
import type { AuditLogRecord } from "@/types/audit-log"
import { format } from "date-fns"

interface AuditLogsTableProps {
    logs: AuditLogRecord[]
    total: number
    page: number
    pageSize: number
    totalPages: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
    onSearchChange: (search: string) => void
    onEventTypeFilter: (eventType: string) => void
    onResourceFilter: (resource: string) => void
    onSortChange: (sortBy: string, sortOrder: string) => void
}

const formatDetails = (details: Record<string, any> | null): string => {
    if (!details) return "-"
    return JSON.stringify(details, null, 2)
}

export function AuditLogsTable({
    logs,
    total,
    page,
    pageSize,
    totalPages,
    onPageChange,
    onPageSizeChange,
    onSearchChange,
    onEventTypeFilter,
    onResourceFilter,
    onSortChange,
}: AuditLogsTableProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [eventFilter, setEventFilter] = useState("all")
    const [resourceFilter, setResourceFilter] = useState("all")
    const [sortBy, setSortBy] = useState("timestamp")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

    const handleSearch = (value: string) => {
        setSearchTerm(value)
        onSearchChange(value)
    }

    const handleEventFilter = (event: string) => {
        setEventFilter(event)
        onEventTypeFilter(event)
    }

    const handleResourceFilter = (resource: string) => {
        setResourceFilter(resource)
        onResourceFilter(resource)
    }

    const handleSortChange = (by: string, order: "asc" | "desc") => {
        setSortBy(by)
        setSortOrder(order)
        onSortChange(by, order)
    }

    const columns: ColumnDef<AuditLogRecord>[] = [
        {
            header: "User",
            width: "200px",
            cell: (row) => (
                <span className="text-sm text-gray-700">
                    {row.user_email || row.user_id || "-"}
                </span>
            ),
        },
        {
            header: "Action",
            cell: (row) => (
                <Badge variant="outline" className="text-xs font-mono">
                    {row.event_type}
                </Badge>
            ),
        },
        {
            header: "Resource",
            cell: (row) => (
                <div className="text-sm">
                    <div className="font-medium text-gray-700">
                        {row.resource_type || "-"}
                    </div>
                    {row.resource_id && (
                        <div className="text-xs text-gray-500 font-mono">
                            {row.resource_id.slice(0, 8)}...
                        </div>
                    )}
                </div>
            ),
        },
        {
            header: "Details",
            cell: (row) => (
                <div className="max-w-xs">
                    <code className="text-xs text-gray-600 whitespace-pre-wrap">
                        {formatDetails(row.details)}
                    </code>
                </div>
            ),
        },
        {
            header: "Timestamp",
            cell: (row) => (
                <span className="text-sm text-gray-600">
                    {format(new Date(row.timestamp), "dd/MM/yyyy, HH:mm:ss")}
                </span>
            ),
        },
    ]

    const filters: FilterConfig[] = [
        {
            type: "select",
            placeholder: "All Actions",
            value: eventFilter,
            options: [
                { label: "All Actions", value: "all" },
                { label: "Create Portal", value: "portal:create" },
                { label: "Generate API Key", value: "apikey:generate" },
                { label: "Deactivate User", value: "user:deactivate" },
            ],
            onChange: (value) => {
                if (typeof value === "string") {
                    handleEventFilter(value)
                }
            },
        },
        {
            type: "select",
            placeholder: "All Resources",
            value: resourceFilter,
            options: [
                { label: "All Resources", value: "all" },
                { label: "Portal", value: "PORTAL" },
                { label: "User", value: "USER" },
                { label: "API Key", value: "API_KEY" },
            ],
            onChange: (value) => {
                if (typeof value === "string") {
                    handleResourceFilter(value)
                }
            },
        },
        {
            type: "select",
            placeholder: "Newest First",
            value: sortBy,
            options: [
                { label: "Newest First", value: "timestamp" },
                { label: "Event Type", value: "event_type" },
                { label: "User", value: "user_email" },
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
                placeholder="Search by user email or resource ID..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="max-w-md"
            />

            {/* DataTable with filters */}
            <DataTable
                columns={columns}
                data={logs}
                filters={filters}
                pagination={{
                    page,
                    pageSize,
                    total,
                    totalPages,
                    onPageChange,
                    onPageSizeChange,
                }}
                emptyMessage="No audit logs found"
            />
        </div>
    )
}
