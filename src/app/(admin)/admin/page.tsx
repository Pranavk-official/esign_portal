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

// Mock recent activity data
const recentActivities = [
  {
    id: "1",
    timestamp: "2024-01-15T14:32:00Z",
    event_type: "portal:created",
    actor: "super-admin@o",
    target: "portal-hr-dept",
  },
  {
    id: "2",
    timestamp: "2024-01-15T14:28:15Z",
    event_type: "user:created",
    actor: "admin-002",
    target: "portal-finance",
  },
  {
    id: "3",
    timestamp: "2024-01-15T15:42Z",
    event_type: "key:generated",
    actor: "manager-hr-001",
    target: "portal-hr-dept",
  },
  {
    id: "4",
    timestamp: "2024-01-15T12:08:20Z",
    event_type: "portal:revoked",
    actor: "super-admin@o",
    target: "portal-old-system",
  },
  {
    id: "5",
    timestamp: "2024-01-15T13:46:10Z",
    event_type: "user:deactivated",
    actor: "admin-002",
    target: "portal-operations",
  },
]

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Portals"
          value="12"
          subtitle="10 Active"
          icon={MdSpaceDashboard}
          iconClassName="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <MetricCard
          title="Total Users"
          value="247"
          subtitle="Across all portals"
          icon={MdGroup}
          iconClassName="text-green-600"
          iconBgColor="bg-green-100"
        />
        <MetricCard
          title="Total Transactions"
          value="45,678"
          subtitle="All time"
          icon={MdDescription}
          iconClassName="text-purple-600"
          iconBgColor="bg-purple-100"
        />
        <MetricCard
          title="Failure Rate"
          value="0.51%"
          subtitle="234 failed"
          icon={MdError}
          iconClassName="text-orange-600"
          iconBgColor="bg-orange-100"
        />
      </div>

      {/* Recent Activity Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Activity</h2>

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
      </div>
    </div>
  )
}
