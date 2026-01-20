import type { PaginatedResponse, Nullable } from "./common"

// Transaction Status
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "USER_CANCELLED" | "CANCELLED"

// API Usage Record
export interface ApiUsageRecord {
    gateway_txn_id: string
    portal_id: string
    api_key_id: Nullable<string>
    api_key_name: Nullable<string> // Added based on schema
    portal_doc_id: Nullable<string>
    status: string // Schema says string, but we can verify if it's enum
    auth_mode: Nullable<string>
    file_hash: string
    signed_file_hash: Nullable<string>
    created_at: string
    updated_at: Nullable<string>
}

// Paginated Response
export type ApiUsagePaginatedResponse = PaginatedResponse<ApiUsageRecord>

// Query Parameters
export interface ListApiUsageParams {
    page?: number
    page_size?: number
    portal_id?: Nullable<string> // Make portal_id optional/nullable as per params
    api_key_id?: Nullable<string>
    status?: Nullable<string>
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
