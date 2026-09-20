"use client";

import { useMemo } from "react";

import type { Payout, PayoutStatus } from "@/@types/payout";
import { DataTable } from "@/components/ui/data-table";
import { TableEmptyState } from "@/components/ui/table-empty-state";
import { ExportButton } from "@/components/export-button";
import { koboToNaira } from "@/utils/functions";

import { PAYOUT_STATUS_LABEL } from "./PayoutStatusBadge";
import {
  buildSettlementColumns,
  initiatorLabel,
  settlementAccountLabel,
  SETTLEMENT_COLUMN_MANIFEST,
} from "./settlement-columns";

const STATUS_OPTIONS: PayoutStatus[] = [
  "PENDING",
  "PROCESSING",
  "SUCCESS",
  "FAILED",
  "REVERSED",
];

interface SettlementTableProps {
  payouts: Payout[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  status?: PayoutStatus;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onStatusChange: (status?: PayoutStatus) => void;
  onRefresh: () => void;
  onViewDetails: (id: string) => void;
}

export function SettlementTable({
  payouts,
  isLoading,
  isFetching,
  isError,
  error,
  totalCount,
  pageIndex,
  pageSize,
  status,
  onPageChange,
  onPageSizeChange,
  onStatusChange,
  onRefresh,
  onViewDetails,
}: SettlementTableProps) {
  const columns = useMemo(
    () => buildSettlementColumns({ onViewDetails }),
    [onViewDetails]
  );

  // Amounts are exported in Naira, matching what the table shows — exporting the
  // raw kobo integers put figures 100x too large into the spreadsheet.
  const exportData = useMemo(
    () =>
      payouts.map((p) => ({
        Date: new Date(p.createdAt).toLocaleDateString(),
        "Transaction ID": p.providerReference,
        Amount: koboToNaira(p.amount),
        Fee: koboToNaira(p.feeAmount),
        Status: PAYOUT_STATUS_LABEL[p.status] ?? p.status,
        "Settlement Account": settlementAccountLabel(p),
        "Initiated By": initiatorLabel(p),
        "NIP Reference": p.providerNipReference ?? "",
      })),
    [payouts]
  );

  return (
    <DataTable
      title="Settlement History"
      columns={columns}
      data={payouts}
      isLoading={isLoading}
      isRefetching={isFetching && !isLoading}
      isError={isError}
      error={error}
      onRefresh={onRefresh}
      serverPagination={{
        totalCount,
        pageIndex,
        pageSize,
        onPageChange,
        onPageSizeChange,
      }}
      filterControl={
        <div className="flex items-center gap-2">
          <select
            value={status ?? ""}
            onChange={(e) =>
              onStatusChange(
                e.target.value ? (e.target.value as PayoutStatus) : undefined
              )
            }
            aria-label="Filter by status"
            className="h-10 cursor-pointer rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 shadow-xs outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {PAYOUT_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <ExportButton
            data={exportData}
            filename="Settlements_Payouts"
            sheetName="Payouts"
            disabled={payouts.length === 0}
          />
        </div>
      }
      empty={
        <TableEmptyState
          title={
            status
              ? `No ${PAYOUT_STATUS_LABEL[status].toLowerCase()} settlements`
              : "No settlements yet"
          }
          description={
            status
              ? "Try a different status filter to see other payouts."
              : "Withdrawals you make from your wallet will appear here once they're processed."
          }
        />
      }
      fullView={{
        columns,
        manifest: SETTLEMENT_COLUMN_MANIFEST,
        title: "Settlement History",
        tableId: "settlements",
      }}
    />
  );
}
