import { apiClient } from './client';
import { PaginatedResponse } from './types';

export interface AuditLogRecord {
    id: string;
    user_id: string | null;
    user_email: string | null;
    portal_id: string | null;
    event_type: string;
    resource_type: string | null;
    resource_id: string | null;
    details: Record<string, any> | null;
    ip_address: string | null;
    user_agent: string | null;
    timestamp: string;
}

export interface AuditLogQueryParams {
    page?: number;
    page_size?: number;
    search?: string;
    user_id?: string;
    portal_id?: string;
    event_type?: string;
    start_date?: string;
    end_date?: string;
    sort_by?: 'timestamp' | 'event_type' | 'portal_id';
    sort_order?: 'asc' | 'desc';
}

export const auditLogsApi = {
    list: async (params?: AuditLogQueryParams) => {
        const response = await apiClient.get<PaginatedResponse<AuditLogRecord>>('/admin/audit-logs', { params });
        return response.data;
    },
};
