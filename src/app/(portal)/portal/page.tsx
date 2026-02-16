"use client";

import { MdCheckCircle, MdSchedule, MdTrendingUp, MdVpnKey } from "react-icons/md";

import { MetricCard } from "@/components/shared/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useCurrentUser } from "@/hooks/use-auth";
import { usePortalMetrics } from "@/hooks/use-portals";
import { hasRole, ROLES } from "@/lib/auth/roles";

export default function PortalDashboardPage() {
  const { data: metrics, isLoading } = usePortalMetrics();
  const { user } = useCurrentUser();

  const isAdmin = user ? hasRole(user, [ROLES.PORTAL_ADMIN]) : false;

  const successRate = metrics
    ? ((metrics.successful / (metrics.total_transactions || 1)) * 100).toFixed(1) + "%"
    : "0%";

  return (
    <div className="space-y-6">
      {/* Welcome Message for Portal Users */}
      {!isAdmin && (
        <Card className="glass-card bg-primary/5">
          <CardContent className="pt-6">
            <h2 className="mb-2 text-xl font-semibold">Welcome to Your Portal</h2>
            <p className="text-muted-foreground">
              You can view your profile, update your information, and access your activity history
              from the menu above.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Metrics Grid - Portal Admin Only */}
      {isAdmin && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Transactions"
              value={
                isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  metrics?.total_transactions.toString() || "0"
                )
              }
              subtitle="All time"
              icon={MdTrendingUp}
            // Using defaults for primary style
            />

            <MetricCard
              title="Success Rate"
              value={isLoading ? <Skeleton className="h-8 w-16" /> : successRate}
              subtitle={`${metrics?.successful || 0} successful`}
              icon={MdCheckCircle}
              iconClassName="text-emerald-500"
              iconBgColor="bg-emerald-500/10"
            />

            <MetricCard
              title="Active Keys"
              value={
                isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  metrics?.api_keys_metrics?.length.toString() || "0"
                )
              }
              subtitle="Currently active"
              icon={MdVpnKey}
              iconClassName="text-violet-500"
              iconBgColor="bg-violet-500/10"
            />

            <MetricCard
              title="Pending"
              value={
                isLoading ? <Skeleton className="h-8 w-16" /> : metrics?.pending.toString() || "0"
              }
              subtitle="Awaiting signature"
              icon={MdSchedule}
              iconClassName="text-amber-500"
              iconBgColor="bg-amber-500/10"
            />
          </div>

          {/* Usage Summary Section - Portal Admin Only */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Usage Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableCell className="py-3 text-sm text-muted-foreground">
                      Completed / Successful
                    </TableCell>
                    <TableCell className="py-3 text-right text-sm font-medium text-foreground">
                      {isLoading ? (
                        <Skeleton className="ml-auto h-4 w-12" />
                      ) : (
                        metrics?.successful || 0
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableCell className="py-3 text-sm text-muted-foreground">Pending</TableCell>
                    <TableCell className="py-3 text-right text-sm font-medium text-foreground">
                      {isLoading ? (
                        <Skeleton className="ml-auto h-4 w-12" />
                      ) : (
                        metrics?.pending || 0
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-transparent border-none">
                    <TableCell className="py-3 text-sm text-muted-foreground">Failed</TableCell>
                    <TableCell className="py-3 text-right text-sm font-medium text-foreground">
                      {isLoading ? <Skeleton className="ml-auto h-4 w-12" /> : metrics?.failed || 0}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
