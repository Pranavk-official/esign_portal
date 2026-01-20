"use client"

import { MetricCard } from "@/components/shared/metric-card"
import { MdTrendingUp, MdCheckCircle, MdVpnKey, MdSchedule } from "react-icons/md"
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PortalDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Transactions"
          value="1247"
          subtitle="All time"
          icon={MdTrendingUp}
          iconClassName="text-gray-700"
          iconBgColor="bg-gray-100"
        />

        <MetricCard
          title="Success Rate"
          value="96.1%"
          subtitle="1198 successful"
          icon={MdCheckCircle}
          iconClassName="text-green-600"
          iconBgColor="bg-green-100"
        />

        <MetricCard
          title="Active Keys"
          value="3"
          subtitle="Currently active"
          icon={MdVpnKey}
          iconClassName="text-blue-600"
          iconBgColor="bg-blue-100"
        />

        <MetricCard
          title="Pending"
          value="12"
          subtitle="Awaiting signature"
          icon={MdSchedule}
          iconClassName="text-orange-600"
          iconBgColor="bg-orange-100"
        />
      </div>

      {/* Usage Summary Section */}
      <Card className="border-zinc-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Usage Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow className="hover:bg-transparent border-b">
                <TableCell className="text-sm text-gray-600 py-3">Completed</TableCell>
                <TableCell className="text-sm text-gray-900 text-right py-3 font-medium">1196</TableCell>
              </TableRow>
              <TableRow className="hover:bg-transparent border-b">
                <TableCell className="text-sm text-gray-600 py-3">Pending</TableCell>
                <TableCell className="text-sm text-gray-900 text-right py-3 font-medium">12</TableCell>
              </TableRow>
              <TableRow className="hover:bg-transparent">
                <TableCell className="text-sm text-gray-600 py-3">Failed</TableCell>
                <TableCell className="text-sm text-gray-900 text-right py-3 font-medium">37</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
