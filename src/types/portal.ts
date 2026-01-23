import type { PaginatedResponse, Nullable } from "./common"

// Import request types from schemas (single source of truth)
export type {
    PortalOnboardingRequest,
    PortalRevokeRequest,
    PortalKeyLimitRequest
} from "@/lib/schemas/portal"

// Portal Response
export interface PortalResponse {
    portal_id: string
    name: string
    is_active: boolean
    created_at: string
    live_key_limit: Nullable<number>
}

// Portal List Response (for super admin)
export interface PortalListResponse extends PortalResponse {
    revoke_reason: Nullable<string>
    active_key_count: number
    total_key_count: number
    user_count: number
    max_keys?: Nullable<number>
    environment?: Nullable<string>
    description?: Nullable<string>
    updated_at?: Nullable<string>
}

// Paginated Response
export type PortalListPaginatedResponse = PaginatedResponse<PortalListResponse>

// Query Params
export interface ListPortalsParams {
    page?: number
    page_size?: number
    search?: Nullable<string>
    is_active?: Nullable<boolean>
    sort_by?: string
    sort_order?: "asc" | "desc"
}
