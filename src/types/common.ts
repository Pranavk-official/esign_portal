// Base Response Types
export interface PaginatedResponse<T> {
    items: T[]
    total: number
    page: number
    page_size: number
    total_pages: number
}

// Common Types
export type Nullable<T> = T | null

export type RecordWithId = {
    id: string | number
}
