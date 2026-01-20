"use client"

import { useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { TanstackTable } from "@/components/shared/tanstack-table"
import { useDataTable } from "@/hooks/use-data-table"
import type { AuditLogRecord } from "@/types/audit-log"
import { format } from "date-fns"
import { ColumnDef } from "@tanstack/react-table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface AuditLogsTableProps {
    logs: AuditLogRecord[]
    total: number
    isLoading?: boolean
    params: any
    onParamsChange: (params: any) => void
}

const formatDetails = (details: Record<string, any> | null): string => {
    if (!details) return "-"
    return JSON.stringify(details, null, 2)
}

export function AuditLogsTable({
    logs,
    total,
    isLoading,
    params,
    onParamsChange,
}: AuditLogsTableProps) {
    const columns = useMemo<ColumnDef<AuditLogRecord>[]>(() => [
        {
            accessorKey: "user_email",
            header: "User",
            cell: ({ row }) => (
                <span className="text-sm text-gray-700">
                    {row.original.user_email || row.original.user_id || "-"}
                </span>
            ),
        },
        {
            accessorKey: "event_type",
            header: "Action",
            cell: ({ row }) => (
                <Badge variant="outline" className="text-xs font-mono">
                    {row.original.event_type}
                </Badge>
            ),
        },
        {
            accessorKey: "resource_type",
            header: "Resource",
            cell: ({ row }) => (
                <div className="text-sm">
                    <div className="font-medium text-gray-700">
                        {row.original.resource_type || "-"}
                    </div>
                    {row.original.resource_id && (
                        <div className="text-xs text-gray-500 font-mono">
                            {row.original.resource_id.slice(0, 8)}...
                        </div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "details",
            header: "Details",
            cell: ({ row }) => (
                <div className="max-w-xs">
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
        data: logs,
        totalCount: total,
        onParamsChange,
        initialParams: params,
    })

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4 bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                <div className="flex-1 min-w-[300px]">
                    <Input
                        placeholder="Search by user email or resource ID..."
                        value={params.search || ""}
                        onChange={(e) => onParamsChange({ ...params, search: e.target.value, page: 1 })}
                        className="max-w-md bg-white"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <Select
                        value={params.event_type || "all"}
                        onValueChange={(value) => onParamsChange({ ...params, event_type: value === "all" ? undefined : value, page: 1 })}
                    >
                        <SelectTrigger className="w-[180px] bg-white">
                            <SelectValue placeholder="All Actions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Actions</SelectItem>
                            <SelectItem value="portal:create">Create Portal</SelectItem>
                            <SelectItem value="apikey:generate">Generate API Key</SelectItem>
                            <SelectItem value="user:deactivate">Deactivate User</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={params.resource_type || "all"}
                        onValueChange={(value) => onParamsChange({ ...params, resource_type: value === "all" ? undefined : value, page: 1 })}
                    >
                        <SelectTrigger className="w-[180px] bg-white">
                            <SelectValue placeholder="All Resources" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Resources</SelectItem>
                            <SelectItem value="PORTAL">Portal</SelectItem>
                            <SelectItem value="USER">User</SelectItem>
                            <SelectItem value="API_KEY">API Key</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <TanstackTable
                table={table}
                totalCount={total}
                isLoading={isLoading}
                emptyMessage="No audit logs found"
            />
        </div>
    )
}

