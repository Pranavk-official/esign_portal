import type { PaginatedResponse, Nullable } from "./common"

// API Key Response
export interface ApiKeyResponse {
    id: string
    key_name: Nullable<string>
    key_prefix: string
    environment: string
    callback_url: string
    is_active: boolean
    created_at: string
    expires_at: Nullable<string>
    last_used_at: Nullable<string>
    max_txn_count: Nullable<number>
    remaining_txn_count: Nullable<number>
    successful_txn_count: number
    max_txn_count_threshold: Nullable<number>
}

// Paginated Response
export type ApiKeyListPaginatedResponse = PaginatedResponse<ApiKeyResponse>

// Requests
export interface ApiKeyRevokeRequest {
    is_active: boolean
    reason: Nullable<string>
}

export interface ApiKeyTxnCountUpdateRequest {
    max_txn_count: Nullable<number>
    max_txn_count_threshold: Nullable<number>
}

export interface CallbackUrlUpdate {
    callback_url: string
}

export interface ApiKeyGenerateRequest {
    key_name: string
    environment: "LIVE" | "TEST"
    callback_url: string
}

export interface ApiKeyGenerateResponse {
    api_key: string
    key_id: string
    key_name: string
    environment: "LIVE" | "TEST"
    created_at: string
}


// Query Params
export interface ListApiKeysParams {
    page?: number
    page_size?: number
    search?: Nullable<string>
    environment?: Nullable<string>
    is_active?: Nullable<boolean>
    sort_by?: string
    sort_order?: "asc" | "desc"
}
