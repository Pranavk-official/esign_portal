"use client";

import { flexRender, Table as ReactTable } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TanstackTableProps<TData> {
  table: ReactTable<TData>;
  totalCount: number;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function TanstackTable<TData>({
  table,
  totalCount,
  isLoading = false,
  emptyMessage = "No results.",
}: TanstackTableProps<TData>) {
  const { pageSize, pageIndex } = table.getState().pagination;
  const totalPages = table.getPageCount();

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Table Container - Optimized for Mobile with Shadow Indicators */}
      <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* Horizontal Scroll Container with Mac-style smooth scrolling */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 [-webkit-overflow-scrolling:touch]">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b border-gray-200 bg-gray-50/80 backdrop-blur-sm">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="h-11 px-3 text-xs font-semibold uppercase tracking-wide text-gray-600 sm:px-4 sm:text-xs"
                        style={{ width: header.column.columnDef.size }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <TableRow key={i} className="border-b border-gray-100 last:border-0">
                    {table.getAllColumns().map((column, j) => (
                      <TableCell key={j} className="px-3 py-3 sm:px-4 sm:py-4">
                        <Skeleton className="h-5 w-full animate-pulse rounded bg-gray-200" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, idx) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="group border-b border-gray-100 transition-colors hover:bg-gray-50/50 active:bg-gray-100/50 last:border-0 [@media(hover:hover)]:hover:bg-gray-50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell 
                        key={cell.id}
                        className="px-3 py-3 text-sm sm:px-4 sm:py-4"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell 
                    colSpan={table.getAllColumns().length} 
                    className="h-32 px-3 text-center sm:h-40"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2 text-gray-500">
                      <svg 
                        className="h-12 w-12 text-gray-300" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={1.5} 
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
                        />
                      </svg>
                      <p className="text-sm font-medium">{emptyMessage}</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls - Responsive Design */}
      <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between sm:px-2">
        {/* Results Counter */}
        <div className="text-xs text-gray-600 sm:flex-1 sm:text-sm">
          <span className="font-medium text-gray-900">
            {Math.min(pageIndex * pageSize + 1, totalCount)}-
            {Math.min((pageIndex + 1) * pageSize, totalCount)}
          </span>
          {" "}of{" "}
          <span className="font-medium text-gray-900">{totalCount}</span>
          {" "}results
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:gap-6">
          {/* Rows Per Page - Mobile Friendly */}
          <div className="flex items-center justify-between gap-2 sm:justify-start">
            <p className="text-xs font-medium text-gray-700 sm:text-sm">Rows per page</p>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-9 w-[70px] text-sm focus:ring-2 focus:ring-blue-500 sm:h-10 sm:w-[75px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`} className="text-sm">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Page Info */}
          <div className="hidden text-center text-sm font-medium text-gray-700 sm:flex sm:min-w-[100px] sm:items-center sm:justify-center">
            Page {pageIndex + 1} of {totalPages || 1}
          </div>

          {/* Navigation Buttons - Touch Optimized */}
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            {/* First Page - Desktop Only */}
            <Button
              variant="outline"
              size="icon"
              className="hidden h-9 w-9 touch-manipulation lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              aria-label="Go to first page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Previous Page */}
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 touch-manipulation transition-all active:scale-95 disabled:opacity-50 sm:h-10 sm:w-10"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Go to previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Mobile Page Indicator */}
            <div className="flex min-w-[80px] items-center justify-center text-xs font-medium text-gray-700 sm:hidden">
              {pageIndex + 1} / {totalPages || 1}
            </div>

            {/* Next Page */}
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 touch-manipulation transition-all active:scale-95 disabled:opacity-50 sm:h-10 sm:w-10"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Go to next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Last Page - Desktop Only */}
            <Button
              variant="outline"
              size="icon"
              className="hidden h-9 w-9 touch-manipulation lg:flex"
              onClick={() => table.setPageIndex(totalPages - 1)}
              disabled={!table.getCanNextPage()}
              aria-label="Go to last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
