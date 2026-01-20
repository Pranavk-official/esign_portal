"use client"

import { MetricCard } from "@/components/shared/metric-card"
import { Boxes, Users, Activity, TrendingDown } from "lucide-react"

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Portals"
          value={12}
          subtitle="10 Active"
          icon={Boxes}
          iconClassName="text-blue-600"
        />

        <MetricCard
          title="Total Users"
          value={247}
          subtitle="Across all portals"
          icon={Users}
          iconClassName="text-green-600"
        />

        <MetricCard
          title="Total Transactions"
          value="45,678"
          subtitle="All time"
          icon={Activity}
          iconClassName="text-purple-600"
        />

        <MetricCard
          title="Failure Rate"
          value="0.51%"
          subtitle="234 failed"
          icon={TrendingDown}
          iconClassName="text-red-600"
        />
      </div>

      {/* Recent Activity Section - Placeholder */}
      <div className="p-4 border rounded-md border-dashed">
        <h2 className="font-bold mb-2">Recent Activity</h2>
        <div className="text-muted-foreground text-sm">Activity table component will go here</div>
      </div>
    </div>
  )
}
