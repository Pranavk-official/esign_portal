"use client"

import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { TanstackTable } from "@/components/shared/tanstack-table"
import { useDataTable } from "@/hooks/use-data-table"
import type { UserActivityRecord } from "@/types/user-activity"
import { format } from "date-fns"
import { ColumnDef } from "@tanstack/react-table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface RecentActivityTableProps {
    activities: UserActivityRecord[]
    total: number
    isLoading?: boolean
    params: any
    onParamsChange: (params: any) => void
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
    isLoading,
    params,
    onParamsChange,
}: RecentActivityTableProps) {
    const columns = useMemo<ColumnDef<UserActivityRecord>[]>(() => [
        {
            accessorKey: "event_type",
            header: "Event Type",
            cell: ({ row }) => (
                <Badge variant={getEventBadgeVariant(row.original.event_type)} className="text-xs font-mono">
                    {row.original.event_type}
                </Badge>
            ),
        },
        {
            accessorKey: "details",
            header: "Details",
            cell: ({ row }) => (
                <div className="max-w-md">
                    <code className="text-xs text-gray-600 whitespace-pre-wrap">
                        {formatDetails(row.original.details)}
                    </code>
                </div>
            ),
        },
        {
            accessorKey: "timestamp",
            header: "Timestamp",
            cell: ({ row }) => (
                <span className="text-sm text-gray-600">
                    {format(new Date(row.original.timestamp), "dd/MM/yyyy, HH:mm:ss")}
                </span>
            ),
        },
    ], [])

    const { table } = useDataTable({
        columns,
        data: activities,
        totalCount: total,
        onParamsChange,
        initialParams: params,
    })

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Select
                    value={params.event_type || "all"}
                    onValueChange={(value) => onParamsChange({ ...params, event_type: value === "all" ? undefined : value, page: 1 })}
                >
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="All Events" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Events</SelectItem>
                        <SelectItem value="profile:update">Profile Updates</SelectItem>
                        <SelectItem value="user:login">Login Events</SelectItem>
                        <SelectItem value="user:logout">Logout Events</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <TanstackTable
                table={table}
                totalCount={total}
                isLoading={isLoading}
                emptyMessage="No recent activity found"
            />
        </div>
    )
}

