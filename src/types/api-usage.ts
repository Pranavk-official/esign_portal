import type { PaginatedResponse, Nullable } from "./common"

// Transaction Status
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "USER_CANCELLED"

// API Usage Record
export interface ApiUsageRecord {
    id: string
    gateway_txn_id: string
    portal_id: string
    portal_doc_id: Nullable<string>
    api_key_id: string
    status: TransactionStatus
    file_hash: string
    final_signed_hash: Nullable<string>
    cdac_response_code: Nullable<string>
    cdac_esp_id: Nullable<string>
    auth_mode: Nullable<string>
    created_at: string
    updated_at: string
}

// Paginated Response
export type ApiUsagePaginatedResponse = PaginatedResponse<ApiUsageRecord>

// Query Parameters
export interface ListApiUsageParams {
    page?: number
    page_size?: number
    portal_id?: Nullable<string>
    api_key_id?: Nullable<string>
    status?: Nullable<TransactionStatus>
    start_date?: Nullable<string>
    end_date?: Nullable<string>
    sort_by?: string
    sort_order?: "asc" | "desc"
    search?: Nullable<string>
}

// Usage Summary
export interface ApiUsageSummary {
    total_transactions: number
    completed: number
    pending: number
    failed: number
    cancelled: number
}
