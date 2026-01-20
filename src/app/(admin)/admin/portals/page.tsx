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
import { format } from "date-fns"

// Mock portal data
const portals = [
  {
    id: "portal-hr-001",
    name: "HR Department",
    status: "Active",
    keyLimit: 5,
    stats: {
      keys: 3,
      users: 12,
    },
    createdAt: "2024-10-01T00:00:00Z",
  },
  {
    id: "portal-finance-002",
    name: "Finance Department",
    status: "Active",
    keyLimit: 10,
    stats: {
      keys: 7,
      users: 8,
    },
    createdAt: "2024-08-01T00:00:00Z",
  },
  {
    id: "portal-ops-003",
    name: "Operations",
    status: "Inactive",
    keyLimit: 3,
    stats: {
      keys: 0,
      users: 5,
    },
    createdAt: "2024-05-01T00:00:00Z",
  },
]

export default function AdminPortalsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Portal Management</h1>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <MdAdd className="h-5 w-5 mr-2" />
          Onboard Portal
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by portal id or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
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
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Created Date</SelectItem>
            <SelectItem value="date-asc">Oldest First</SelectItem>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
          </SelectContent>
        </Select>

        {/* Stats Dropdown */}
        <Select defaultValue="descending">
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="descending">Descending</SelectItem>
            <SelectItem value="ascending">Ascending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Portals Table */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-700">Name</TableHead>
              <TableHead className="font-semibold text-gray-700">Status</TableHead>
              <TableHead className="font-semibold text-gray-700">Key Limit</TableHead>
              <TableHead className="font-semibold text-gray-700">Stats</TableHead>
              <TableHead className="font-semibold text-gray-700">Created At</TableHead>
              <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {portals.map((portal) => (
              <TableRow key={portal.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{portal.name}</span>
                    <span className="text-sm text-gray-500">{portal.id}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={portal.status === "Active" ? "default" : "secondary"}
                    className={
                      portal.status === "Active"
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }
                  >
                    {portal.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-700">{portal.keyLimit}</TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span className="text-gray-700">{portal.stats.keys} Keys</span>
                    <span className="text-gray-500">{portal.stats.users} Users</span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-700">
                  {format(new Date(portal.createdAt), "MM/dd/yyyy")}
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
                      <DropdownMenuItem>Edit Portal</DropdownMenuItem>
                      <DropdownMenuItem>Manage Users</DropdownMenuItem>
                      <DropdownMenuItem>Manage Keys</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        Deactivate Portal
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
          Showing <span className="font-medium">1</span> to{" "}
          <span className="font-medium">{portals.length}</span> of{" "}
          <span className="font-medium">{portals.length}</span> | 20 / pe
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
