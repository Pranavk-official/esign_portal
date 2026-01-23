"use client"

import { useState } from "react"
import { RecentActivityTable } from "@/components/tables/recent-activity-table"

export default function RecentActivityPage() {
    const [params, setParams] = useState({
        page: 1,
        page_size: 20,
        search: "",
        event_type: "all" as string,
    })

    // TODO: Implement useUserActivity hook to fetch real data from API
    // const { data, isLoading, error } = useUserActivity(params)
    
    // Placeholder: Empty state until API integration
    const activities: any[] = []
    const totalPages = 0

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

            {activities.length === 0 ? (
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                    <div className="text-center">
                        <p className="text-muted-foreground">No activity records found</p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Activity tracking will be available once API integration is complete
                        </p>
                    </div>
                </div>
            ) : (
                <RecentActivityTable
                    activities={activities}
                    total={activities.length}
                    params={params}
                    onParamsChange={handleParamsChange}
                />
            )}
        </div>
    )
}
