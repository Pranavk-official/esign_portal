"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { DataTable, type ColumnDef, type FilterConfig } from "@/components/shared/data-table"
import type { UserActivityRecord } from "@/types/user-activity"
import { format } from "date-fns"

interface RecentActivityTableProps {
    activities: UserActivityRecord[]
    total: number
    page: number
    pageSize: number
    totalPages: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
    onEventFilter: (eventType: string) => void
}

const formatDetails = (details: Record<string, any> | null): string => {
    if (!details) return "-"

    // Format common detail patterns
    if (details.old_values && details.new_values) {
        const changes = Object.keys(details.new_values).map(key =>
            `${key}: ${details.old_values[key]} → ${details.new_values[key]}`
        )
        return changes.join(", ")
    }

    return JSON.stringify(details, null, 2)
}

const getEventBadgeVariant = (eventType: string): "default" | "secondary" | "outline" => {
    if (eventType.includes("create") || eventType.includes("add")) return "default"
    if (eventType.includes("delete") || eventType.includes("remove")) return "secondary"
    return "outline"
}

export function RecentActivityTable({
    activities,
    total,
    page,
    pageSize,
    totalPages,
    onPageChange,
    onPageSizeChange,
    onEventFilter,
}: RecentActivityTableProps) {
    const [eventFilter, setEventFilter] = useState<string>("all")

    const handleEventFilter = (event: string) => {
        setEventFilter(event)
        onEventFilter(event)
    }

    const columns: ColumnDef<UserActivityRecord>[] = [
        {
            header: "Event Type",
            width: "200px",
            cell: (row) => (
                <Badge variant={getEventBadgeVariant(row.event_type)} className="text-xs font-mono">
                    {row.event_type}
                </Badge>
            ),
        },
        {
            header: "Details",
            cell: (row) => (
                <div className="max-w-md">
                    <code className="text-xs text-gray-600 whitespace-pre-wrap">
                        {formatDetails(row.details)}
                    </code>
                </div>
            ),
        },
        {
            header: "Timestamp",
            width: "200px",
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
            placeholder: "All Events",
            value: eventFilter,
            options: [
                { label: "All Events", value: "all" },
                { label: "Profile Updates", value: "profile:update" },
                { label: "Login Events", value: "user:login" },
                { label: "Logout Events", value: "user:logout" },
            ],
            onChange: (value) => {
                if (typeof value === "string") {
                    handleEventFilter(value)
                }
            },
        },
    ]

    return (
        <DataTable
            columns={columns}
            data={activities}
            filters={filters}
            pagination={{
                page,
                pageSize,
                total,
                totalPages,
                onPageChange,
                onPageSizeChange,
            }}
            emptyMessage="No recent activity found"
        />
    )
}
