// Generated types from OpenAPI spec for User Management

export type UserRole = {
    id: string
    name: string
    description: string | null
}

export type UserListResponse = {
    id: string
    email: string
    portal_id: string | null
    is_active: boolean
    roles: UserRole[]
    created_at: string
    updated_at: string
}

export type UserListPaginatedResponse = {
    items: UserListResponse[]
    total: number
    page: number
    page_size: number
    total_pages: number
}

export type UserCreateRequest = {
    email: string
    portal_id?: string | null
    role_names: string[]
}

export type UserUpdateRequest = {
    email?: string
    role_names?: string[]
    is_active?: boolean
}

export type UserDetailResponse = {
    id: string
    email: string
    portal_id: string | null
    is_active: boolean
    roles: UserRole[]
    created_at: string
    updated_at: string
    last_login_at: string | null
}

// Request parameters for list users
export type ListUsersParams = {
    page?: number
    page_size?: number
    search?: string | null
    portal_id?: string | null
    role_name?: string | null
    is_active?: boolean | null
    sort_by?: string
    sort_order?: string
}
