"use client"

import { MetricCard } from "@/components/shared/metric-card"
import { Users, FileKey, MousePointerClick, CheckCircle } from "lucide-react"

export default function PortalDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Team Members"
          value={8}
          subtitle="5 Active"
          icon={Users}
          iconClassName="text-blue-600"
        />

        <MetricCard
          title="API Keys"
          value={3}
          subtitle="2 Production"
          icon={FileKey}
          iconClassName="text-green-600"
        />

        <MetricCard
          title="API Requests"
          value="12,543"
          subtitle="This month"
          icon={MousePointerClick}
          iconClassName="text-purple-600"
        />

        <MetricCard
          title="Success Rate"
          value="99.2%"
          subtitle="Last 30 days"
          icon={CheckCircle}
          iconClassName="text-green-600"
        />
      </div>

      {/* Usage Overview Section - Placeholder */}
      <div className="p-4 border rounded-md border-dashed">
        <h2 className="font-bold mb-2">Usage Overview</h2>
        <div className="text-muted-foreground text-sm">Usage charts and analytics will go here</div>
      </div>
    </div>
  )
}
