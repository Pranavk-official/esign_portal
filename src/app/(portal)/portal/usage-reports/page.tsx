"use client"

import { useState } from "react"
import { MdSearch, MdCalendarToday } from "react-icons/md"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Mock transaction data
const transactions = [
  {
    id: "1",
    txnId: "txn-abc-RN1",
    docId: "DOC-0001-RN1",
    keyName: "Billing App",
    status: "COMPLETED",
    fileHash: "a87b56...xai1",
    time: "2024-09-12T20:00:00Z",
  },
  {
    id: "2",
    txnId: "txn-abc-RN2",
    docId: "DOC-0001-RN2",
    keyName: "Test Integration",
    status: "PENDING",
    fileHash: "bbcd01...lx47",
    time: "2024-09-12T19:48:15Z",
  },
  {
    id: "3",
    txnId: "txn-abc-RN3",
    docId: "DOC-0001-RN3",
    keyName: "Billing App",
    status: "FAILED",
    fileHash: "cde453...xls9",
    time: "2024-09-12T19:45:20Z",
  },
]

export default function PortalSearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [apiKeyFilter, setApiKeyFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState("desc")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-blue-600 text-white hover:bg-blue-700"
      case "PENDING":
        return "bg-yellow-500 text-white hover:bg-yellow-600"
      case "FAILED":
        return "bg-red-600 text-white hover:bg-red-700"
      default:
        return "bg-gray-200 text-gray-700 hover:bg-gray-300"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Transaction Log</h1>
      </div>

      {/* Search and Filters - Row 1 */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by txn ID, doc ID, or file hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full lg:w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        {/* API Key Filter */}
        <Select value={apiKeyFilter} onValueChange={setApiKeyFilter}>
          <SelectTrigger className="w-full lg:w-[180px]">
            <SelectValue placeholder="All API Keys" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All API Keys</SelectItem>
            <SelectItem value="billing">Billing App</SelectItem>
            <SelectItem value="test">Test Integration</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Filters and Sort - Row 2 */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* From Date */}
        <div className="relative flex-1">
          <MdCalendarToday className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="From: dd/mm/yyyy"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* To Date */}
        <div className="relative flex-1">
          <MdCalendarToday className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="To: dd/mm/yyyy"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sort By */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full lg:w-[180px]">
            <SelectValue placeholder="Created Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Created Date</SelectItem>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="txnId">Transaction ID</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Order */}
        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger className="w-full lg:w-[160px]">
            <SelectValue placeholder="Descending" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Descending</SelectItem>
            <SelectItem value="asc">Ascending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transaction Table */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-700">Txn ID</TableHead>
              <TableHead className="font-semibold text-gray-700">Doc ID</TableHead>
              <TableHead className="font-semibold text-gray-700">Key Name</TableHead>
              <TableHead className="font-semibold text-gray-700">Status</TableHead>
              <TableHead className="font-semibold text-gray-700">File Hash</TableHead>
              <TableHead className="font-semibold text-gray-700">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((txn) => (
              <TableRow key={txn.id} className="hover:bg-gray-50">
                <TableCell className="font-mono text-sm text-gray-900">
                  {txn.txnId}
                </TableCell>
                <TableCell className="font-mono text-sm text-gray-700">
                  {txn.docId}
                </TableCell>
                <TableCell className="text-gray-900">{txn.keyName}</TableCell>
                <TableCell>
                  <Badge
                    variant="default"
                    className={getStatusColor(txn.status)}
                  >
                    {txn.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm text-gray-600">
                  {txn.fileHash}
                </TableCell>
                <TableCell className="text-gray-700">
                  {new Date(txn.time).toLocaleString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing <span className="font-medium">1-3</span> of{" "}
          <span className="font-medium">3</span> | 20 / pe
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
