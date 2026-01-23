"use client"

import { MdSpaceDashboard, MdGroup, MdDescription, MdError } from "react-icons/md"
import { MetricCard } from "@/components/shared/metric-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

// TODO: Implement useDashboardMetrics() hook to fetch real metrics from /admin/metrics endpoint
// TODO: Implement useRecentActivity() hook to fetch real activity data

export default function AdminDashboardPage() {
  // Placeholder data until API integration
  const metrics = {
    totalPortals: 0,
    activePortals: 0,
    totalUsers: 0,
    totalTransactions: 0,
    failureRate: "0%",
    failedCount: 0,
  }
  
  const recentActivities: any[] = []
  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Portals"
          value={metrics.totalPortals.toString()}
          subtitle={`${metrics.activePortals} Active`}
          icon={MdSpaceDashboard}
          iconClassName="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <MetricCard
          title="Total Users"
          value={metrics.totalUsers.toString()}
          subtitle="Across all portals"
          icon={MdGroup}
          iconClassName="text-green-600"
          iconBgColor="bg-green-100"
        />
        <MetricCard
          title="Total Transactions"
          value={metrics.totalTransactions.toLocaleString()}
          subtitle="All time"
          icon={MdDescription}
          iconClassName="text-purple-600"
          iconBgColor="bg-purple-100"
        />
        <MetricCard
          title="Failure Rate"
          value={metrics.failureRate}
          subtitle={`${metrics.failedCount} failed`}
          icon={MdError}
          iconClassName="text-orange-600"
          iconBgColor="bg-orange-100"
        />
      </div>

      {/* Recent Activity Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Activity</h2>

        {recentActivities.length === 0 ? (
          <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg bg-white">
            <div className="text-center">
              <p className="text-muted-foreground">No recent activity</p>
              <p className="text-xs text-muted-foreground mt-2">
                Activity tracking will be available once API integration is complete
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-md border bg-white">
            <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">Timestamp</TableHead>
                <TableHead className="font-semibold text-gray-700">Event Type</TableHead>
                <TableHead className="font-semibold text-gray-700">Actor</TableHead>
                <TableHead className="font-semibold text-gray-700">Target</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivities.map((activity) => (
                <TableRow key={activity.id} className="hover:bg-gray-50">
                  <TableCell className="text-sm text-gray-600">
                    {format(new Date(activity.timestamp), "yyyy-MM-dd HH:mm:ss")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-mono">
                      {activity.event_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {activity.actor}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {activity.target}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        )}
      </div>
    </div>
  )
}
