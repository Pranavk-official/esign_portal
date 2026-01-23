"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  Updater,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

import type { TableQueryParams } from "@/lib/api/types";

interface UseDataTableProps<TData, TValue, TParams extends TableQueryParams = TableQueryParams> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalCount: number;
  onParamsChange?: (params: TParams) => void;
  initialParams?: TParams;
}

export function useDataTable<TData, TValue, TParams extends TableQueryParams = TableQueryParams>({
  columns,
  data,
  totalCount,
  onParamsChange,
  initialParams,
}: UseDataTableProps<TData, TValue, TParams>) {
  const [sorting, setSorting] = useState<SortingState>(
    initialParams?.sort_by
      ? [{ id: initialParams.sort_by, desc: initialParams.sort_order === "desc" }]
      : []
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState(initialParams?.search || "");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: (initialParams?.page || 1) - 1,
    pageSize: initialParams?.page_size || 20,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
    pageCount: Math.ceil(totalCount / pagination.pageSize),
    onSortingChange: (updater: Updater<SortingState>) => {
      const nextSorting = typeof updater === "function" ? updater(sorting) : updater;
      setSorting(nextSorting);

      if (onParamsChange) {
        const sort = nextSorting[0];
        onParamsChange({
          sort_by: sort?.id,
          sort_order: sort ? (sort.desc ? "desc" : "asc") : undefined,
        } as TParams);
      }
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: (value: string) => {
      setGlobalFilter(value);
      if (onParamsChange) {
        onParamsChange({ search: value, page: 1 } as TParams);
      }
    },
    onPaginationChange: (updater: Updater<PaginationState>) => {
      const nextPagination = typeof updater === "function" ? updater(pagination) : updater;
      setPagination(nextPagination);
      if (onParamsChange) {
        onParamsChange({
          page: nextPagination.pageIndex + 1,
          page_size: nextPagination.pageSize,
        } as TParams);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  return { table, globalFilter, setGlobalFilter };
}
