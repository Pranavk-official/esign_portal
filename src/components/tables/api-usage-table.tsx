"use client"

import { useState, useMemo } from "react"
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
import { format } from "date-fns"
import { ColumnDef } from "@tanstack/react-table"
import { TanstackTable } from "@/components/shared/tanstack-table"
import { useDataTable } from "@/hooks/use-data-table"
import { ApiUsageRecord } from "@/lib/api/usage"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface ApiUsageTableProps {
    records: ApiUsageRecord[]
    total: number
    isLoading?: boolean
    params: any
    onParamsChange: (params: any) => void
}

const getStatusVariant = (status: string): "default" | "destructive" | "secondary" | "outline" => {
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
    isLoading,
    params,
    onParamsChange,
}: ApiUsageTableProps) {
    const columns = useMemo<ColumnDef<ApiUsageRecord>[]>(() => [
        {
            accessorKey: "gateway_txn_id",
            header: "Gateway Txn ID",
            cell: ({ row }) => (
                <span className="text-sm font-mono text-gray-700">
                    {row.original.gateway_txn_id}
                </span>
            ),
        },
        {
            accessorKey: "portal_id",
            header: "Portal / Key",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <Badge variant="outline" className="text-xs mb-1 w-fit">
                        {row.original.portal_id}
                    </Badge>
                    {row.original.api_key_name && (
                        <span className="text-xs text-muted-foreground" title="API Key Name">
                            Key: {row.original.api_key_name}
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={getStatusVariant(row.original.status)} className="text-xs">
                    {row.original.status}
                </Badge>
            ),
        },
        {
            accessorKey: "auth_mode",
            header: "Auth Mode",
            cell: ({ row }) => (
                <span className="text-sm text-gray-600">
                    {row.original.auth_mode || "-"}
                </span>
            ),
        },
        {
            accessorKey: "created_at",
            header: "Created At",
            cell: ({ row }) => (
                <span className="text-sm text-gray-600">
                    {row.original.created_at ? format(new Date(row.original.created_at), "dd/MM/yyyy, HH:mm:ss") : "-"}
                </span>
            ),
        },
        {
            id: "actions",
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
    ], [])

    const { table } = useDataTable({
        columns,
        data: records,
        totalCount: total,
        onParamsChange,
        initialParams: params,
    })

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4 bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                <div className="flex-1 min-w-[300px]">
                    <Input
                        placeholder="Search by txn ID, doc ID, or file hash..."
                        value={params.search || ""}
                        onChange={(e) => onParamsChange({ ...params, search: e.target.value, page: 1 })}
                        className="max-w-md bg-white"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <Select
                        value={params.status || "all"}
                        onValueChange={(value) => onParamsChange({ ...params, status: value === "all" ? undefined : value, page: 1 })}
                    >
                        <SelectTrigger className="w-[150px] bg-white">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="FAILED">Failed</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="USER_CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">From:</span>
                        <Input
                            type="date"
                            value={params.start_date || ""}
                            onChange={(e) => onParamsChange({ ...params, start_date: e.target.value, page: 1 })}
                            className="w-[150px] bg-white"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">To:</span>
                        <Input
                            type="date"
                            value={params.end_date || ""}
                            onChange={(e) => onParamsChange({ ...params, end_date: e.target.value, page: 1 })}
                            className="w-[150px] bg-white"
                        />
                    </div>
                </div>
            </div>

            <TanstackTable
                table={table}
                totalCount={total}
                isLoading={isLoading}
                emptyMessage="No API usage records found"
            />
        </div>
    )
}

