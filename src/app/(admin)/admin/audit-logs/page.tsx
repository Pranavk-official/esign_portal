"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuditLogsTable } from "@/components/tables/audit-logs-table"
import type { AuditLogRecord } from "@/types/audit-log"

// Mock data
const mockLogs: AuditLogRecord[] = [
    {
        id: "1",
        user_id: "user-123",
        user_email: "super@example.com",
        portal_id: "portal-hr-001",
        event_type: "CREATE_PORTAL",
        resource_type: "PORTAL",
        resource_id: "portal-hr-001",
        details: { "portal_name": "HR Department" },
        ip_address: "192.168.1.1",
        user_agent: "Mozilla/5.0",
        timestamp: "2024-01-15T20:00:00Z",
    },
    {
        id: "2",
        user_id: "user-124",
        user_email: "manager@example.com",
        portal_id: "portal-fin-002",
        event_type: "GENERATE_API_KEY",
        resource_type: "API_KEY",
        resource_id: "key-prod-002",
        details: { "environment": "PRODUCTION" },
        ip_address: "192.168.1.2",
        user_agent: "Mozilla/5.0",
        timestamp: "2024-01-15T19:38:15Z",
    },
    {
        id: "3",
        user_id: "user-123",
        user_email: "super@example.com",
        portal_id: null,
        event_type: "DEACTIVATE_USER",
        resource_type: "USER",
        resource_id: "user-001",
        details: { "email": "john.doe@example.com" },
        ip_address: "192.168.1.1",
        user_agent: "Mozilla/5.0",
        timestamp: "2024-01-15T19:35:00Z",
    },
]

export default function AuditLogsPage() {
    const [logs] = useState<AuditLogRecord[]>(mockLogs)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [searchQuery, setSearchQuery] = useState("")
    const [eventFilter, setEventFilter] = useState("all")
    const [resourceFilter, setResourceFilter] = useState("all")
    const [sortBy, setSortBy] = useState("timestamp")
    const [sortOrder, setSortOrder] = useState("desc")

    // Filter logic
    const filteredLogs = logs.filter((log) => {
        if (searchQuery && !(log.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) || log.resource_id?.includes(searchQuery))) {
            return false
        }
        if (eventFilter !== "all" && log.event_type !== eventFilter) {
            return false
        }
        if (resourceFilter !== "all" && log.resource_type !== resourceFilter) {
            return false
        }
        return true
    })

    const totalPages = Math.ceil(filteredLogs.length / pageSize)
    const paginatedLogs = filteredLogs.slice((page - 1) * pageSize, page * pageSize)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Audit Logs</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        View system activity and changes
                    </p>
                </div>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </div>

            <AuditLogsTable
                logs={paginatedLogs}
                total={filteredLogs.length}
                page={page}
                pageSize={pageSize}
                totalPages={totalPages}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                    setPageSize(size)
                    setPage(1)
                }}
                onSearchChange={(search) => {
                    setSearchQuery(search)
                    setPage(1)
                }}
                onEventTypeFilter={(event) => {
                    setEventFilter(event)
                    setPage(1)
                }}
                onResourceFilter={(resource) => {
                    setResourceFilter(resource)
                    setPage(1)
                }}
                onSortChange={(by, order) => {
                    setSortBy(by)
                    setSortOrder(order)
                }}
            />
        </div>
    )
}
