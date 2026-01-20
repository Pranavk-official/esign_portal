"use client"

import { useQuery } from "@tanstack/react-query"
import { auditLogsApi, type AuditLogQueryParams } from "@/lib/api/audit-logs"

export function useAuditLogs(params?: AuditLogQueryParams) {
    return useQuery({
        queryKey: ["audit-logs", params],
        queryFn: () => auditLogsApi.list(params),
    })
}
