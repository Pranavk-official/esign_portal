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
          iconBgColor="bg-indigo-100/40"
          isLoading={overviewLoading}
          animationDelay={200}
        />
        <MetricCard
          title="Active Users"
          value={totalActiveUsers.toLocaleString()}
          subtitle="Across all portals"
          icon={MdGroup}
          iconClassName="text-indigo-500"
          iconBgColor="bg-violet-100/30"
          isLoading={overviewLoading}
          animationDelay={250}
        />
        <MetricCard
          title="Active API Keys"
          value={totalActiveApiKeys.toLocaleString()}
          subtitle="LIVE + TEST"
          icon={MdKey}
          iconClassName="text-violet-600"
          iconBgColor="bg-indigo-100/30"
          isLoading={overviewLoading}
          animationDelay={300}
        />
        <MetricCard
          title="Success Rate"
          value={`${successRate.toFixed(1)}%`}
          subtitle="Overall system"
          icon={MdSpaceDashboard}
          iconClassName="text-indigo-600"
          iconBgColor="bg-violet-100/40"
          isLoading={overviewLoading}
          animationDelay={350}
        />
      </div>

      {/* Transaction Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Transactions"
          value={totalTransactions.toLocaleString()}
          subtitle="All time"
          icon={MdDescription}
          iconClassName="text-slate-600"
          iconBgColor="bg-slate-100/30"
          isLoading={overviewLoading}
          animationDelay={200}
        />
        <MetricCard
          title="Successful"
          value={successfulTransactions.toLocaleString()}
          subtitle="Completed"
          icon={MdSpaceDashboard}
          iconClassName="text-indigo-600"
          iconBgColor="bg-indigo-100/30"
          isLoading={overviewLoading}
          animationDelay={250}
        />
        <MetricCard
          title="Pending"
          value={pendingTransactions.toLocaleString()}
          subtitle="In progress"
          icon={MdGroup}
          iconClassName="text-violet-600"
          iconBgColor="bg-violet-100/30"
          isLoading={overviewLoading}
          animationDelay={300}
        />
        <MetricCard
          title="Failed"
          value={failedTransactions.toLocaleString()}
          subtitle="Error transactions"
          icon={MdError}
          iconClassName="text-orange-600"
          iconBgColor="bg-orange-100/30"
          isLoading={overviewLoading}
          animationDelay={350}
        />
      </div>

      {/* Recent Activity Section */}
      <div className="space-y-4 animate-fade-in" style={{ animationDelay: "400ms" }}>
        <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>

        {activityLoading ? (
          <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50">
            <div className="text-center">
              <p className="text-muted-foreground">Loading activity...</p>
            </div>
          </div>
        ) : recentActivities.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50">
            <div className="text-center">
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-indigo-200 bg-card/40 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-indigo-300">
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-background/40 hover:bg-background/60">
                  <TableHead className="font-semibold text-foreground">Timestamp</TableHead>
                  <TableHead className="font-semibold text-foreground">Event Type</TableHead>
                  <TableHead className="font-semibold text-foreground">User</TableHead>
                  <TableHead className="font-semibold text-foreground">Resource</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivities.map((activity: AuditLogRecord, index: number) => (
                  <TableRow key={activity.id} className="border-border hover:bg-indigo-50 transition-colors stagger-item-{Math.min(index, 9)}" style={{ animationDelay: `${400 + (index * 30)}ms` }}>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(activity.timestamp), "yyyy-MM-dd HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs bg-background/60">
                        {activity.event_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {activity.user_email || "System"}
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
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
