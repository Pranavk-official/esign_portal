"use client"

import { useState } from "react"
import { MdAdd, MdSearch, MdMoreVert } from "react-icons/md"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

// Mock API keys data
const apiKeys = [
  {
    id: "1",
    name: "Billing App",
    prefix: "sk_live_abc123",
    environment: "LIVE",
    limits: "732/1000",
    limitType: "transactions",
    lastUsed: "2024-10-24T18:00:00Z",
  },
  {
    id: "2",
    name: "Test Integration",
    prefix: "sk_test_xyz789",
    environment: "TEST",
    limits: "Unlimited",
    limitType: null,
    lastUsed: null,
  },
]

export default function ApiKeysPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [envFilter, setEnvFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">API Keys</h1>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <MdAdd className="h-5 w-5 mr-2" />
          Generate Key
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by key name or prefix..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Environment Filter */}
        <Select value={envFilter} onValueChange={setEnvFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="All Env" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Env</SelectItem>
            <SelectItem value="live">Live</SelectItem>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Options */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Created Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Created Date</SelectItem>
            <SelectItem value="date-asc">Oldest First</SelectItem>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
          </SelectContent>
        </Select>

        {/* Descending */}
        <Select defaultValue="descending">
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="descending">Descending</SelectItem>
            <SelectItem value="ascending">Ascending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* API Keys Table */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-700">Name</TableHead>
              <TableHead className="font-semibold text-gray-700">Prefix</TableHead>
              <TableHead className="font-semibold text-gray-700">Environment</TableHead>
              <TableHead className="font-semibold text-gray-700">Limits</TableHead>
              <TableHead className="font-semibold text-gray-700">Last Used</TableHead>
              <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.map((key) => (
              <TableRow key={key.id} className="hover:bg-gray-50">
                <TableCell className="font-medium text-gray-900">{key.name}</TableCell>
                <TableCell className="font-mono text-sm text-gray-600">{key.prefix}</TableCell>
                <TableCell>
                  <Badge
                    variant={key.environment === "LIVE" ? "default" : "secondary"}
                    className={
                      key.environment === "LIVE"
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }
                  >
                    {key.environment}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span className="text-gray-900">{key.limits}</span>
                    {key.limitType && (
                      <span className="text-gray-500">{key.limitType}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-gray-700">
                  {key.lastUsed
                    ? new Date(key.lastUsed).toLocaleString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    : "Never"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MdMoreVert className="h-5 w-5 text-gray-600" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Copy Key</DropdownMenuItem>
                      <DropdownMenuItem>Edit Limits</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        Revoke Key
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing <span className="font-medium">1-2</span> of{" "}
          <span className="font-medium">2</span> | 20 / pe
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            &lt;
          </Button>
          <span className="px-3 py-1 bg-blue-600 text-white rounded">
            Page 1 of 1
          </span>
          <Button variant="outline" size="sm" disabled>
            &gt;
          </Button>
        </div>
      </div>
    </div>
  )
}
