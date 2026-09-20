"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { PaymentCategory } from "@/@types/transaction";
import { DataTable } from "@/components/ui/data-table";
import { TableEmptyState } from "@/components/ui/table-empty-state";

const MANIFEST = [
  { key: "name", label: "Name" },
  { key: "description", label: "Description" },
];

interface FeeCategoryTableProps {
  categories: PaymentCategory[];
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  error?: unknown;
  searchQuery?: string;
  action?: React.ReactNode;
  onSearch: (term: string) => void;
  onRefresh: () => void;
}

export function FeeCategoryTable({
  categories,
  isLoading = false,
  isFetching = false,
  isError = false,
  error,
  searchQuery = "",
  action,
  onSearch,
  onRefresh,
}: FeeCategoryTableProps) {
  const columns = useMemo<ColumnDef<PaymentCategory, unknown>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <span className="font-medium text-gray-900">{row.original.name}</span>
        ),
      },
      {
        id: "description",
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <span className="text-gray-600">{row.original.description || "—"}</span>
        ),
      },
    ],
    []
  );

  return (
    <DataTable
      title="Fee Categories"
      action={action}
      columns={columns}
      data={categories}
      isLoading={isLoading}
      isRefetching={isFetching && !isLoading}
      isError={isError}
      error={error}
      onRefresh={onRefresh}
      onSearch={onSearch}
      searchPlaceholder="Search categories..."
      pageSize={10}
      empty={
        <TableEmptyState
          title={
            searchQuery ? "No categories match your search" : "No fee categories yet"
          }
          description={
            searchQuery
              ? "Try a different category name."
              : "Categories group your fees — create one to get started."
          }
        />
      }
      fullView={{
        columns,
        manifest: MANIFEST,
        title: "Fee Categories",
        tableId: "fee-categories",
      }}
    />
  );
}
