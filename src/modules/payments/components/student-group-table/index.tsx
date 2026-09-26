/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronRight } from "lucide-react";

import { ClassItem } from "@/@types/class";
import { StudentTransactionGroup } from "@/@types/transaction";
import { DataTable } from "@/components/ui/data-table";
import { TableEmptyState } from "@/components/ui/table-empty-state";
import {
  EXPANDER_COLUMN_ID,
  SELECT_COLUMN_ID,
} from "@/lib/table-column-prefs";
import { formatNaira } from "@/utils/functions";
import { getPaymentStatusBadge } from "@/utils/transaction-status";

const MANIFEST = [
  { key: "student", label: "Student Names" },
  { key: "class", label: "Class" },
  { key: "totalBill", label: "Total Bill" },
  { key: "amountPaid", label: "Amount Paid" },
  { key: "balanceOwing", label: "Balance Owing" },
];

export function resolveClassName(
  cls: unknown,
  classItems: ClassItem[] = []
): string {
  if (!cls) return "";
  if (typeof cls === "object" && cls !== null && "name" in cls) {
    return (cls as { name?: string }).name ?? "";
  }
  const id = typeof cls === "object" && cls !== null ? (cls as any)._id : cls;
  const match = classItems.find((c) => c._id === id);
  return match ? match.name : typeof cls === "string" ? cls : "";
}

function groupTotals(group: StudentTransactionGroup) {
  const totalBill = group.totalBilled ?? group.totalOwed ?? 0;
  const amountPaid = group.totalAmountPaid ?? group.totalPaid ?? 0;
  // Balance Owing comes from the API's own totalOutstanding rather than
  // `totalBill - amountPaid`: with an academic period selected, totalOutstanding
  // already folds in `arrears` (debt from earlier terms), which the local
  // subtraction has no way to know about and would silently drop.
  const balanceOwing = group.totalOutstanding ?? group.outstanding ?? 0;
  const arrears = group.arrears ?? 0;
  return { totalBill, amountPaid, balanceOwing, arrears };
}

function groupId(group: StudentTransactionGroup): string {
  // `lastTransactionAt` was a third fallback here, but it's the one field the
  // register's "students with no payments" change (Term Billing Handoff,
  // section D) makes null for unpaid students — several such rows would all
  // resolve to the same key. It only ever covered a malformed student record
  // (no _id and no id), which student._id should never actually be.
  return group.student?._id ?? group.student?.id ?? "";
}

interface StudentGroupTableProps {
  items?: StudentTransactionGroup[];
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  error?: unknown;
  classItems: ClassItem[];
  selectedPaymentIds: string[];
  setSelectedPaymentIds: React.Dispatch<React.SetStateAction<string[]>>;
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  searchTerm?: string;
  filterControl?: React.ReactNode;
  action?: React.ReactNode;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSearch: (term: string) => void;
  onRefresh: () => void;
}

export function StudentGroupTable({
  items = [],
  isLoading = false,
  isFetching = false,
  isError = false,
  error,
  classItems = [],
  selectedPaymentIds,
  setSelectedPaymentIds,
  totalCount,
  pageIndex,
  pageSize,
  searchTerm,
  filterControl,
  action,
  onPageChange,
  onPageSizeChange,
  onSearch,
  onRefresh,
}: StudentGroupTableProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleRow = (id: string) =>
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const togglePayment = (id: string) =>
    setSelectedPaymentIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );

  const toggleGroup = (paymentIds: string[], allSelected: boolean) =>
    setSelectedPaymentIds((prev) =>
      allSelected
        ? prev.filter((id) => !paymentIds.includes(id))
        : [...new Set([...prev, ...paymentIds])]
    );

  const balanceClass = (balance: number) => {
    if (balance > 0) return "text-red-600";
    if (balance < 0) return "text-green-600";
    return "text-gray-500";
  };

  const columns = useMemo<ColumnDef<StudentTransactionGroup, unknown>[]>(
    () => [
      {
        id: EXPANDER_COLUMN_ID,
        enableHiding: false,
        header: "",
        cell: ({ row }) => {
          const id = groupId(row.original);
          const isOpen = expandedIds.includes(id);
          return (
            <button
              onClick={() => toggleRow(id)}
              aria-label={isOpen ? "Collapse payments" : "Expand payments"}
              aria-expanded={isOpen}
              className="cursor-pointer rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          );
        },
      },
      {
        id: SELECT_COLUMN_ID,
        enableHiding: false,
        header: "",
        cell: ({ row }) => {
          const paymentIds = (row.original.payments ?? []).map((p) => p._id);
          const allSelected =
            paymentIds.length > 0 &&
            paymentIds.every((id) => selectedPaymentIds.includes(id));
          const someSelected = paymentIds.some((id) =>
            selectedPaymentIds.includes(id)
          );
          return (
            <input
              type="checkbox"
              disabled={paymentIds.length === 0}
              checked={allSelected}
              // Partially-selected groups read as indeterminate, which no
              // `checked` value can express — it has to be set on the node.
              ref={(el) => {
                if (el) el.indeterminate = !allSelected && someSelected;
              }}
              onChange={() => toggleGroup(paymentIds, allSelected)}
              aria-label="Select this student's payments"
              className="size-4 cursor-pointer rounded border-2 border-gray-300 accent-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
            />
          );
        },
      },
      {
        id: "student",
        header: "Student Names",
        accessorFn: (row) =>
          `${row.student?.firstName ?? ""} ${row.student?.lastName ?? ""}`.trim(),
        cell: ({ row }) => {
          const name = `${row.original.student?.firstName ?? ""} ${
            row.original.student?.lastName ?? ""
          }`.trim();
          return (
            <div>
              <p className="text-sm font-medium text-gray-900">{name || "—"}</p>
              {row.original.student?.admissionNumber && (
                <p className="text-xs text-gray-500">
                  {row.original.student.admissionNumber}
                </p>
              )}
            </div>
          );
        },
      },
      {
        id: "class",
        header: "Class",
        cell: ({ row }) => resolveClassName(row.original.student?.class, classItems),
      },
      {
        id: "totalBill",
        header: "Total Bill",
        cell: ({ row }) => (
          <span className="tabular-nums text-gray-900">
            {formatNaira(groupTotals(row.original).totalBill)}
          </span>
        ),
      },
      {
        id: "amountPaid",
        header: "Amount Paid",
        cell: ({ row }) => (
          <span className="tabular-nums text-gray-900">
            {formatNaira(groupTotals(row.original).amountPaid)}
          </span>
        ),
      },
      {
        id: "balanceOwing",
        header: "Balance Owing",
        cell: ({ row }) => {
          const { balanceOwing, arrears } = groupTotals(row.original);
          return (
            <div>
              <span
                className={`font-semibold tabular-nums ${balanceClass(balanceOwing)}`}
              >
                {formatNaira(balanceOwing)}
              </span>
              {arrears > 0 && (
                <p className="text-xs text-amber-600">
                  incl. {formatNaira(arrears)} arrears
                </p>
              )}
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [expandedIds, selectedPaymentIds, classItems]
  );

  return (
    <DataTable
      title="Payments by Student"
      action={action}
      columns={columns}
      data={items}
      isLoading={isLoading}
      isRefetching={isFetching && !isLoading}
      isError={isError}
      error={error}
      onRefresh={onRefresh}
      onSearch={onSearch}
      searchPlaceholder="Search students..."
      filterControl={filterControl}
      serverPagination={{
        totalCount,
        pageIndex,
        pageSize,
        onPageChange,
        onPageSizeChange,
      }}
      getRowId={groupId}
      expandedRowIds={expandedIds}
      renderExpandedRow={(group) => {
        const { totalBill, amountPaid } = groupTotals(group);
        if (!group.payments?.length) {
          // amountPaid is the student's unfiltered total for the period — if
          // it's 0 they have genuinely never paid; if it's positive, they have,
          // but the current status/category filter hides those transactions
          // from `payments` (those fields are documented as unaffected by
          // those filters), so the two cases need different copy.
          return (
            <p className="text-sm text-gray-500">
              {amountPaid === 0
                ? "No payments yet."
                : "No transactions match the current filters for this student."}
            </p>
          );
        }
        return (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="w-10 px-4 py-2" />
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Reference
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Fee Item
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Amount
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {group.payments.map((p) => {
                  const badge = getPaymentStatusBadge(
                    p.status,
                    p.closesPaymentItem
                  );
                  const feeItem =
                    typeof p.paymentItem === "object"
                      ? (p.paymentItem?.name ?? "")
                      : ((p.paymentItem as any) ?? "");
                  return (
                    <tr
                      key={p._id}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={selectedPaymentIds.includes(p._id)}
                          onChange={() => togglePayment(p._id)}
                          aria-label={`Select payment ${p.reference ?? p._id}`}
                          className="size-4 cursor-pointer rounded border-2 border-gray-300 accent-purple-500"
                        />
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {p.reference || p.groupReference || "—"}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {feeItem || "—"}
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">
                        {formatNaira(p.amount)}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="flex justify-end gap-6 border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500">
              <span>
                Total Bill:{" "}
                <span className="font-medium text-gray-700">
                  {formatNaira(totalBill)}
                </span>
              </span>
              <span>
                Amount Paid:{" "}
                <span className="font-medium text-gray-700">
                  {formatNaira(amountPaid)}
                </span>
              </span>
              <span>
                Payments shown:{" "}
                <span className="font-medium text-gray-700">
                  {formatNaira(group.paymentsTotalAmount ?? 0)}
                </span>
              </span>
            </div>
          </div>
        );
      }}
      empty={
        <TableEmptyState
          title={
            searchTerm
              ? "No students match your search"
              : "No student payment records found"
          }
          description={
            searchTerm
              ? "Try a different name, or clear the filters above."
              : "Once fees are billed and payments come in, they'll show up here."
          }
        />
      }
      fullView={{
        columns,
        manifest: MANIFEST,
        title: "Payments by Student",
        tableId: "payments-by-student",
      }}
    />
  );
}
