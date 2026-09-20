"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";

import { SessionData } from "@/@types/academic-session";
import { DataTable } from "@/components/ui/data-table";
import { TableEmptyState } from "@/components/ui/table-empty-state";
import { ACTIONS_COLUMN_ID } from "@/lib/table-column-prefs";
import { formatDate } from "@/utils/functions";

const MANIFEST = [
  { key: "name", label: "Period Name" },
  { key: "startDate", label: "Start Date" },
  { key: "endDate", label: "End Date" },
  { key: "isActive", label: "Status" },
];

interface AcademicTableProps {
  periods: SessionData[];
  isLoading: boolean;
  isFetching?: boolean;
  isError?: boolean;
  error?: unknown;
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  searchTerm?: string;
  action?: React.ReactNode;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSearch: (term: string) => void;
  onRefresh: () => void;
  onEdit?: (period: SessionData) => void;
}

export default function AcademicTable({
  periods,
  isLoading,
  isFetching,
  isError,
  error,
  totalCount,
  pageIndex,
  pageSize,
  searchTerm,
  action,
  onPageChange,
  onPageSizeChange,
  onSearch,
  onRefresh,
  onEdit,
}: AcademicTableProps) {
  const columns = useMemo<ColumnDef<SessionData, unknown>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: "Period Name",
        cell: ({ row }) => (
          <span className="font-medium text-gray-900">{row.original.name}</span>
        ),
      },
      {
        id: "startDate",
        accessorKey: "startDate",
        header: "Start Date",
        cell: ({ row }) => formatDate(row.original.startDate),
      },
      {
        id: "endDate",
        accessorKey: "endDate",
        header: "End Date",
        cell: ({ row }) => formatDate(row.original.endDate),
      },
      {
        id: "isActive",
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              row.original.isActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {row.original.isActive ? "Active" : "Completed"}
          </span>
        ),
      },
      {
        id: ACTIONS_COLUMN_ID,
        header: "",
        enableHiding: false,
        cell: ({ row }) => (
          <button
            onClick={() => onEdit?.(row.original)}
            title="Edit period"
            className="cursor-pointer rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <Pencil size={16} />
          </button>
        ),
      },
    ],
    [onEdit]
  );

  return (
    <DataTable
      title="Academic Periods"
      action={action}
      columns={columns}
      data={periods}
      isLoading={isLoading}
      isRefetching={!!isFetching && !isLoading}
      isError={isError}
      error={error}
      onRefresh={onRefresh}
      onSearch={onSearch}
      searchPlaceholder="Search periods..."
      serverPagination={{
        totalCount,
        pageIndex,
        pageSize,
        onPageChange,
        onPageSizeChange,
      }}
      empty={
        <TableEmptyState
          title={
            searchTerm ? "No periods match your search" : "No academic periods yet"
          }
          description={
            searchTerm
              ? "Try a different period name."
              : "Add an academic period to start tracking sessions and fees."
          }
        />
      }
      fullView={{
        columns,
        manifest: MANIFEST,
        title: "Academic Periods",
        tableId: "academic-periods",
      }}
    />
  );
}
