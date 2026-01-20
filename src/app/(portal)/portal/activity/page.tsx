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
    const [params, setParams] = useState({
        page: 1,
        page_size: 20,
        search: "",
        event_type: "all" as string,
    })

    // Filter logic
    const filteredActivities = activities.filter((activity) => {
        if (params.event_type !== "all" && activity.event_type !== params.event_type) {
            return false
        }
        return true
    })

    const totalPages = Math.ceil(filteredActivities.length / params.page_size)
    const paginatedActivities = filteredActivities.slice(
        (params.page - 1) * params.page_size,
        params.page * params.page_size
    )

    const handleParamsChange = (newParams: Record<string, number | string>) => {
        setParams(prev => ({ ...prev, ...newParams }))
    }

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
                params={params}
                onParamsChange={handleParamsChange}
            />
        </div>
    )
}
