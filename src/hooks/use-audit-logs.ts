import { useQuery } from "@tanstack/react-query";

import { auditLogsApi } from "@/lib/api/audit-logs";
import type { AuditLogQueryParams } from "@/lib/schemas/audit-log";

export function useAuditLogs(params?: AuditLogQueryParams) {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () => auditLogsApi.list(params),
  });
}
