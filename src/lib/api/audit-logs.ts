import { type AuditLogQueryParams, type AuditLogRecord } from "@/lib/schemas/audit-log";
import { type PaginatedResponse } from "@/lib/schemas/common";

import { apiClient } from "./client";

export type { AuditLogQueryParams, AuditLogRecord };

export const auditLogsApi = {
  list: async (params?: AuditLogQueryParams): Promise<PaginatedResponse<AuditLogRecord>> => {
    const response = await apiClient.get<PaginatedResponse<AuditLogRecord>>("/admin/audit-logs", {
      params,
    });
    return response.data;
  },
};
