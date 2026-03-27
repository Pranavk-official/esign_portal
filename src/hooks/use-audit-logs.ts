import { useQuery } from "@tanstack/react-query";

import { auditLogsApi } from "@/lib/api/audit-logs";
import { queryKeys } from "@/lib/auth/query-keys";
import type { AuditLogQueryParams } from "@/lib/schemas/audit-log";

export function useAuditLogs(params?: AuditLogQueryParams) {
  return useQuery({
    queryKey: queryKeys.auditLogs.list(params),
    queryFn: () => auditLogsApi.list(params),
  });
}
