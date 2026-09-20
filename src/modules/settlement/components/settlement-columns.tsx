import type { ColumnDef } from "@tanstack/react-table";

import type { Payout } from "@/@types/payout";
import type { ColumnManifest } from "@/components/ui/column-manager";
import { ACTIONS_COLUMN_ID } from "@/lib/table-column-prefs";
import { formatKobo } from "@/utils/functions";

import { PayoutStatusBadge } from "./PayoutStatusBadge";

function formatRelativeDate(dateStr: string) {
  const d = new Date(dateStr);
  const diffHours = (Date.now() - d.getTime()) / (1000 * 60 * 60);

  if (diffHours < 24) {
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
  if (diffHours < 48) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** The account may arrive as a bare id or fully populated, depending on the endpoint. */
export function settlementAccountLabel(payout: Payout): string {
  const account = payout.settlementAccount;
  if (!account) return "—";
  if (typeof account === "string") return account;
  return `${account.bankName} · ${account.accountNumber}`;
}

export function initiatorLabel(payout: Payout): string {
  const by = payout.initiatedBy;
  if (!by) return "—";
  return (
    by.fullName ||
    [by.firstName, by.lastName].filter(Boolean).join(" ") ||
    by.email
  );
}

export function buildSettlementColumns({
  onViewDetails,
}: {
  onViewDetails: (id: string) => void;
}): ColumnDef<Payout, unknown>[] {
  return [
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: "Time / Date",
      cell: ({ row }) => (
        <span className="font-medium text-gray-700">
          {formatRelativeDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "providerReference",
      accessorKey: "providerReference",
      header: "Transaction ID",
      cell: ({ row }) => (
        <span className="font-mono text-gray-600">
          {row.original.providerReference?.slice(0, 16) ||
            row.original._id.slice(0, 12)}
        </span>
      ),
    },
    {
      id: "amount",
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-semibold text-gray-900">
          {formatKobo(row.original.amount)}
        </span>
      ),
    },
    {
      id: "feeAmount",
      accessorKey: "feeAmount",
      header: "Fee",
      cell: ({ row }) => (
        <span className="text-gray-500">{formatKobo(row.original.feeAmount)}</span>
      ),
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <PayoutStatusBadge status={row.original.status} />,
    },
    {
      id: "settlementAccount",
      accessorKey: "settlementAccount",
      header: "Settlement Account",
      cell: ({ row }) => (
        <span className="text-gray-600">{settlementAccountLabel(row.original)}</span>
      ),
    },
    {
      id: "initiatedBy",
      accessorKey: "initiatedBy",
      header: "Initiated By",
      cell: ({ row }) => (
        <span className="text-gray-600">{initiatorLabel(row.original)}</span>
      ),
    },
    {
      id: "providerNipReference",
      accessorKey: "providerNipReference",
      header: "NIP Reference",
      cell: ({ row }) => (
        <span className="font-mono text-gray-500">
          {row.original.providerNipReference || "—"}
        </span>
      ),
    },
    {
      id: ACTIONS_COLUMN_ID,
      header: "",
      enableHiding: false,
      cell: ({ row }) => (
        <button
          onClick={() => onViewDetails(row.original._id)}
          className="cursor-pointer px-2 text-sm font-semibold text-purple-600 transition-colors hover:text-purple-800"
        >
          View
        </button>
      ),
    },
  ];
}

/** Label list the "Columns" picker renders from — keys must match the column ids. */
export const SETTLEMENT_COLUMN_MANIFEST: ColumnManifest[] = [
  { key: "createdAt", label: "Time / Date" },
  { key: "providerReference", label: "Transaction ID" },
  { key: "amount", label: "Amount" },
  { key: "feeAmount", label: "Fee" },
  { key: "status", label: "Status" },
  { key: "settlementAccount", label: "Settlement Account" },
  { key: "initiatedBy", label: "Initiated By" },
  { key: "providerNipReference", label: "NIP Reference" },
];
