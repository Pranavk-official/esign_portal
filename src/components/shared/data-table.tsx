"use client"

import { ReactNode } from "react"
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
import { Button } from "@/components/ui/button"
import type { RecordWithId } from "@/types/common"

export interface ColumnDef<T> {
    header: string
    accessorKey?: keyof T
    cell?: (row: T) => ReactNode
    width?: string
}

export interface FilterOption {
    label: string
    value: string
}

export interface FilterConfig {
    type: "search" | "select" | "date-range"
    placeholder?: string
    options?: FilterOption[]
    onChange: (value: string | { from: string; to: string }) => void
    value?: string
}

export interface PaginationConfig {
    page: number
    pageSize: number
    total: number
    totalPages: number
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
}

interface DataTableProps<T extends RecordWithId> {
    columns: ColumnDef<T>[]
    data: T[]
    filters?: FilterConfig[]
    pagination: PaginationConfig
    emptyMessage?: string
    headerActions?: ReactNode
}

export function DataTable<T extends RecordWithId>({
    columns,
    data,
    filters,
    pagination,
    emptyMessage = "No data found",
    headerActions,
}: DataTableProps<T>) {
    const { page, pageSize, total, totalPages, onPageChange, onPageSizeChange } = pagination

    return (
        <div className="space-y-4">
            {/* Filters Row */}
            {filters && filters.length > 0 && (
                <div className="flex items-center gap-4 flex-wrap">
                    {filters.map((filter, index) => (
                        <div key={index}>
                            {filter.type === "select" && (
                                <Select onValueChange={filter.onChange} value={filter.value}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder={filter.placeholder} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filter.options?.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    ))}
                    {headerActions && <div className="ml-auto">{headerActions}</div>}
                </div>
            )}

            {/* Table */}
            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            {columns.map((column, index) => (
                                <TableHead
                                    key={index}
                                    className="font-semibold text-gray-700"
                                    style={{ width: column.width }}
                                >
                                    {column.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((row, rowIndex) => (
                                <TableRow key={row.id ?? rowIndex} className="hover:bg-gray-50">
                                    {columns.map((column, colIndex) => (
                                        <TableCell key={colIndex}>
                                            {column.cell
                                                ? column.cell(row)
                                                : column.accessorKey
                                                    ? String(row[column.accessorKey] ?? "")
                                                    : ""}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm">
                <div className="text-muted-foreground">
                    Showing {Math.min((page - 1) * pageSize + 1, total)}-
                    {Math.min(page * pageSize, total)} of {total}
                </div>

                <div className="flex items-center gap-2">
                    <Select
                        value={pageSize.toString()}
                        onValueChange={(value) => onPageSizeChange(parseInt(value, 10))}
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
                            aria-label="Go to first page"
                        >
                            «
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onPageChange(page - 1)}
                            disabled={page === 1}
                            aria-label="Go to previous page"
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
                            aria-label="Go to next page"
                        >
                            ›
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onPageChange(totalPages)}
                            disabled={page >= totalPages}
                            aria-label="Go to last page"
                        >
                            »
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
