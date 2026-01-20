"use client"

import { useState } from "react"
import { RecentActivityTable } from "@/components/tables/recent-activity-table"
import type { UserActivityRecord } from "@/types/user-activity"

// Mock data
const mockActivities: UserActivityRecord[] = [
    {
        id: "1",
        event_type: "profile:update",
        timestamp: "2024-01-15T20:00:00Z",
        details: {
            old_values: { email: "old@example.com" },
            new_values: { email: "new@example.com" },
        },
    },
    {
        id: "2",
        event_type: "user:login",
        timestamp: "2024-01-15T19:45:00Z",
        details: {
            ip_address: "192.168.1.1",
            user_agent: "Mozilla/5.0",
        },
    },
    {
        id: "3",
        event_type: "user:logout",
        timestamp: "2024-01-15T18:30:00Z",
        details: null,
    },
]

export default function RecentActivityPage() {
    const [activities] = useState<UserActivityRecord[]>(mockActivities)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [eventFilter, setEventFilter] = useState("all")

    // Filter logic
    const filteredActivities = activities.filter((activity) => {
        if (eventFilter !== "all" && activity.event_type !== eventFilter) {
            return false
        }
        return true
    })

    const totalPages = Math.ceil(filteredActivities.length / pageSize)
    const paginatedActivities = filteredActivities.slice(
        (page - 1) * pageSize,
        page * pageSize
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Recent Activity</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        View your recent actions and changes
                    </p>
                </div>
            </div>

            <RecentActivityTable
                activities={paginatedActivities}
                total={filteredActivities.length}
                page={page}
                pageSize={pageSize}
                totalPages={totalPages}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                    setPageSize(size)
                    setPage(1)
                }}
                onEventFilter={(event) => {
                    setEventFilter(event)
                    setPage(1)
                }}
            />
        </div>
    )
}
