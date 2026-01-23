import type { PaginatedResponse, Nullable } from "./common"

// Import request types from schemas (single source of truth)
export type { UserCreateRequest, UserUpdateRequest } from "@/lib/schemas/user"

// User Role
export interface UserRole {
    id: string
    name: string
    description: Nullable<string>
}

// User List Response (for tables)
export interface UserListResponse {
    id: string
    email: string
    portal_id: Nullable<string>
    is_active: boolean
    created_at: string
    roles: UserRole[]
    updated_at: string
}

// User Detail Response (for detail views)
export interface UserDetailResponse {
    id: string
    email: string
    portal_id: Nullable<string>
    is_active: boolean
    created_at: string
    roles: UserRole[]
}

// Paginated Response
export type UserListPaginatedResponse = PaginatedResponse<UserListResponse>

// Query Parameters
export interface ListUsersParams {
    page?: number
    page_size?: number
    search?: Nullable<string>
    portal_id?: Nullable<string>
    role_name?: Nullable<string>
    is_active?: Nullable<boolean>
    sort_by?: string
    sort_order?: "asc" | "desc"
}
