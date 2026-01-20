import type { PaginatedResponse, Nullable } from "./common"

// Audit Log Record
export interface AuditLogRecord {
    id: string
    user_id: Nullable<string>
    user_email: Nullable<string>
    portal_id: Nullable<string>
    event_type: string
    resource_type: Nullable<string>
    resource_id: Nullable<string>
    details: Nullable<Record<string, any>>
    ip_address: Nullable<string>
    user_agent: Nullable<string>
    timestamp: string
}

// Paginated Response
export type AuditLogPaginatedResponse = PaginatedResponse<AuditLogRecord>

// Query Parameters
export interface ListAuditLogsParams {
    page?: number
    page_size?: number
    search?: Nullable<string>
    user_id?: Nullable<string>
    portal_id?: Nullable<string>
    event_type?: Nullable<string>
    start_date?: Nullable<string>
    end_date?: Nullable<string>
    sort_by?: string
    sort_order?: "asc" | "desc"
}
