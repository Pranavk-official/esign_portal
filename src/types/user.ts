import type { PaginatedResponse, Nullable } from "./common"

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
    roles: UserRole[]
    created_at: string
    updated_at: string
}

// User Detail Response (for detail views)
export interface UserDetailResponse extends UserListResponse {
    last_login_at: Nullable<string>
}

// Paginated Response
export type UserListPaginatedResponse = PaginatedResponse<UserListResponse>

// Request Types
export interface UserCreateRequest {
    email: string
    portal_id?: Nullable<string>
    role_names: string[]
}

export interface UserUpdateRequest {
    email?: string
    role_names?: string[]
    is_active?: boolean
}

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
