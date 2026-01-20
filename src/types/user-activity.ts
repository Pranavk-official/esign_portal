// Types for User Activity (Recent Activity)

export interface UserActivityRecord {
    id: string | number  // Required for table row keys
    event_type: string
    timestamp: string
    details: Record<string, any> | null
}

export interface UserActivityParams {
    skip?: number
    limit?: number
}
