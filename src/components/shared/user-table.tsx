"use client"

import { useState } from "react"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { UserListResponse } from "@/types/user"

type UserTableProps = {
    users: UserListResponse[]
    total: number
    page: number
    pageSize: number
    totalPages: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
    onSearchChange: (search: string) => void
    onRoleFilter: (role: string) => void
    onStatusFilter: (status: string) => void
    onSortChange: (sortBy: string, sortOrder: string) => void
}

export function UserTable({
    users,
    total,
    page,
    pageSize,
    totalPages,
    onPageChange,
    onPageSizeChange,
    onSearchChange,
    onRoleFilter,
    onStatusFilter,
    onSortChange,
}: UserTableProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [sortBy, setSortBy] = useState("created_at")
    const [sortOrder, setSortOrder] = useState("desc")

    const handleSearch = (value: string) => {
        setSearchTerm(value)
        onSearchChange(value)
    }

    const handleSort = (field: string) => {
        const newOrder = sortBy === field && sortOrder === "asc" ? "desc" : "asc"
        setSortBy(field)
        setSortOrder(newOrder)
        onSortChange(field, newOrder)
    }

    const getInitials = (email: string) => {
        const parts = email.split("@")[0].split(".")
        return parts
            .slice(0, 2)
            .map((p) => p[0])
            .join("")
            .toUpperCase()
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-4">
                <Input
                    placeholder="Search by email or user ID..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="max-w-sm"
                />

                <Select onValueChange={onRoleFilter}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="portal_admin">Portal Admin</SelectItem>
                        <SelectItem value="portal_user">Portal User</SelectItem>
                    </SelectContent>
                </Select>

                <Select onValueChange={onStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={sortBy}
                    onValueChange={(value) => {
                        setSortBy(value)
                        onSortChange(value, sortOrder)
                    }}
                >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="created_at">Created Date</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="is_active">Status</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={sortOrder}
                    onValueChange={(value) => {
                        setSortOrder(value)
                        onSortChange(sortBy, value)
                    }}
                >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Order" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">User</TableHead>
                            <TableHead>Portal</TableHead>
                            <TableHead>Roles</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No users found
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                                {getInitials(user.email)}
                                            </div>
                                            <span>{user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {user.portal_id || "Global"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            {user.role_names.map((role) => (
                                                <Badge key={role} variant="secondary">
                                                    {role.replace("_", " ")}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.is_active ? "default" : "secondary"}>
                                            {user.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    {user.is_active ? "Deactivate" : "Activate"}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Showing {Math.min((page - 1) * pageSize + 1, total)}-
                    {Math.min(page * pageSize, total)} of {total}
                </div>

                <div className="flex items-center gap-2">
                    <Select
                        value={pageSize.toString()}
                        onValueChange={(value) => onPageSizeChange(parseInt(value))}
                    >
                        <SelectTrigger className="w-[100px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10 / page</SelectItem>
                            <SelectItem value="20">20 / page</SelectItem>
                            <SelectItem value="50">50 / page</SelectItem>
                            <SelectItem value="100">100 / page</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onPageChange(1)}
                            disabled={page === 1}
                        >
                            «
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onPageChange(page - 1)}
                            disabled={page === 1}
                        >
                            ‹
                        </Button>
                        <div className="px-3 text-sm">
                            Page {page} of {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onPageChange(page + 1)}
                            disabled={page >= totalPages}
                        >
                            ›
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onPageChange(totalPages)}
                            disabled={page >= totalPages}
                        >
                            »
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
