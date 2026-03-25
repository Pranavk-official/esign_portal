"use client";

import { format } from "date-fns";
import {
  MdBusiness,
  MdDescription,
  MdError,
  MdGroup,
  MdKey,
  MdSpaceDashboard,
} from "react-icons/md";

import { MetricCard } from "@/components/shared/metric-card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuditLogs } from "@/hooks/use-audit-logs";
import { useSystemOverview } from "@/hooks/use-metrics";
import { type AuditLogRecord } from "@/lib/api/audit-logs";

export default function AdminDashboardPage() {
  // Fetch system overview metrics for Super Admin
  const { data: overview, isLoading: overviewLoading } = useSystemOverview();

  // Fetch recent activity (last 10 items)
  const { data: activityData, isLoading: activityLoading } = useAuditLogs({
    page: 1,
    page_size: 10,
    sort_by: "timestamp",
    sort_order: "desc",
  });

  const recentActivities = activityData?.data || [];

  // Use the system overview metrics
  const totalTransactions = overview?.total_transactions || 0;
  const successfulTransactions = overview?.total_completed_transactions || 0;
  const failedTransactions = overview?.total_failed_transactions || 0;
  const pendingTransactions = overview?.total_pending_transactions || 0;
  const successRate = overview?.success_rate || 0;
  const totalActivePortals = overview?.total_active_portals || 0;
  const totalActiveUsers = overview?.total_active_users || 0;
  const totalActiveApiKeys = overview?.total_active_api_keys || 0;

  return (
    <div className="space-y-6">
      {/* System Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Portals"
          value={totalActivePortals.toLocaleString()}
          subtitle="Currently active"
          icon={MdBusiness}
          iconClassName="text-indigo-600"
          iconBgColor="bg-indigo-100"
          isLoading={overviewLoading}
        />
        <MetricCard
          title="Active Users"
          value={totalActiveUsers.toLocaleString()}
          subtitle="Across all portals"
          icon={MdGroup}
          iconClassName="text-blue-600"
          iconBgColor="bg-blue-100"
          isLoading={overviewLoading}
        />
        <MetricCard
          title="Active API Keys"
          value={totalActiveApiKeys.toLocaleString()}
          subtitle="LIVE + TEST"
          icon={MdKey}
          iconClassName="text-cyan-600"
          iconBgColor="bg-cyan-100"
          isLoading={overviewLoading}
        />
        <MetricCard
          title="Success Rate"
          value={`${successRate.toFixed(1)}%`}
          subtitle="Overall system"
          icon={MdSpaceDashboard}
          iconClassName="text-green-600"
          iconBgColor="bg-green-100"
          isLoading={overviewLoading}
        />
      </div>

      {/* Transaction Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Transactions"
          value={totalTransactions.toLocaleString()}
          subtitle="All time"
          icon={MdDescription}
          iconClassName="text-purple-600"
          iconBgColor="bg-purple-100"
          isLoading={overviewLoading}
        />
        <MetricCard
          title="Successful"
          value={successfulTransactions.toLocaleString()}
          subtitle="Completed"
          icon={MdSpaceDashboard}
          iconClassName="text-green-600"
          iconBgColor="bg-green-100"
          isLoading={overviewLoading}
        />
        <MetricCard
          title="Pending"
          value={pendingTransactions.toLocaleString()}
          subtitle="In progress"
          icon={MdGroup}
          iconClassName="text-blue-600"
          iconBgColor="bg-blue-100"
          isLoading={overviewLoading}
        />
        <MetricCard
          title="Failed"
          value={failedTransactions.toLocaleString()}
          subtitle="Error transactions"
          icon={MdError}
          iconClassName="text-orange-600"
          iconBgColor="bg-orange-100"
          isLoading={overviewLoading}
        />
      </div>

      {/* Recent Activity Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Activity</h2>

        {activityLoading ? (
          <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed bg-white">
            <div className="text-center">
              <p className="text-muted-foreground">Loading activity...</p>
            </div>
          </div>
        ) : recentActivities.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed bg-white">
            <div className="text-center">
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          </div>
        ) : (
          <div className="rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">Timestamp</TableHead>
                  <TableHead className="font-semibold text-gray-700">Event Type</TableHead>
                  <TableHead className="font-semibold text-gray-700">User</TableHead>
                  <TableHead className="font-semibold text-gray-700">Resource</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivities.map((activity: AuditLogRecord) => (
                  <TableRow key={activity.id} className="hover:bg-gray-50">
                    <TableCell className="text-sm text-gray-600">
                      {format(new Date(activity.timestamp), "yyyy-MM-dd HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {activity.event_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {activity.user_email || "System"}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {activity.resource_type || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
