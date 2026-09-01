/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { TableSkeleton } from "../../Loader/table-loader";
import { ClassItem } from "@/@types/class";
import { StudentTransactionGroup } from "@/@types/transaction";
import { getPaymentStatusBadge } from "@/utils/transaction-status";
import { formatNaira } from "@/utils/functions";

interface StudentGroupTableProps {
  items?: StudentTransactionGroup[];
  isLoading?: boolean;
  classItems: ClassItem[];
  selectedPaymentIds: string[];
  setSelectedPaymentIds: React.Dispatch<React.SetStateAction<string[]>>;
}

const FEE_STATUS_BADGE: Record<string, { label: string; className: string }> = {
  COMPLETED: { label: "Completed", className: "text-green-700 bg-green-50" },
  PART_PAYMENT: { label: "Part Payment", className: "text-amber-700 bg-amber-50" },
  OUTSTANDING: { label: "Outstanding", className: "text-red-700 bg-red-50" },
};

export function resolveClassName(
  cls: unknown,
  classItems: ClassItem[] = [],
): string {
  if (!cls) return "";
  if (typeof cls === "object" && cls !== null && "name" in cls) {
    return (cls as { name?: string }).name ?? "";
  }
  const id = typeof cls === "object" && cls !== null ? (cls as any)._id : cls;
  const match = classItems.find((c) => c._id === id);
  return match ? match.name : typeof cls === "string" ? cls : "";
}

export function StudentGroupTable({
  items = [],
  isLoading = false,
  classItems = [],
  selectedPaymentIds,
  setSelectedPaymentIds,
}: StudentGroupTableProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const togglePayment = (id: string) =>
    setSelectedPaymentIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );

  const toggleGroup = (paymentIds: string[], allSelected: boolean) =>
    setSelectedPaymentIds((prev) =>
      allSelected
        ? prev.filter((id) => !paymentIds.includes(id))
        : [...new Set([...prev, ...paymentIds])],
    );

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 w-10" />
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Student Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Class
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Total Paid
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Outstanding
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Fee Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Payments
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeleton />
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No student payment records found
                </td>
              </tr>
            ) : (
              items.map((group) => {
                const studentId = group.student?._id ?? group.student?.id ?? "";
                const isOpen = !!expanded[studentId];
                const feeBadge =
                  FEE_STATUS_BADGE[group.status] ?? {
                    label: group.status,
                    className: "text-gray-700 bg-gray-100",
                  };
                const studentName = `${group.student?.firstName ?? ""} ${
                  group.student?.lastName ?? ""
                }`.trim();
                const paymentIds = (group.payments ?? []).map((p) => p._id);
                const allSelected =
                  paymentIds.length > 0 &&
                  paymentIds.every((id) => selectedPaymentIds.includes(id));
                const someSelected = paymentIds.some((id) =>
                  selectedPaymentIds.includes(id),
                );

                return (
                  <Fragment key={studentId || group.lastTransactionAt}>
                    <tr
                      onClick={() => toggleRow(studentId)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td
                        className="px-6 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          disabled={paymentIds.length === 0}
                          checked={allSelected}
                          ref={(el) => {
                            if (el)
                              el.indeterminate = !allSelected && someSelected;
                          }}
                          onChange={() => toggleGroup(paymentIds, allSelected)}
                          className="w-4 h-4 border-2 border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">
                            {isOpen ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {studentName || "—"}
                            </p>
                            {group.student?.admissionNumber && (
                              <p className="text-xs text-gray-500">
                                {group.student.admissionNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {resolveClassName(group.student?.class, classItems)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatNaira(group.totalAmountPaid ?? group.totalPaid ?? 0)}
                        {group.overpaid > 0 && (
                          <span className="ml-1 text-xs font-medium text-green-600">
                            (+{formatNaira(group.overpaid)})
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatNaira(
                          group.totalOutstanding ?? group.outstanding ?? 0,
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${feeBadge.className}`}
                        >
                          {feeBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {group.paymentCount}
                      </td>
                    </tr>

                    {isOpen && (
                      <tr className="bg-gray-50/60">
                        <td colSpan={7} className="px-6 py-4">
                          {group.payments?.length ? (
                            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                              <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                  <tr>
                                    <th className="px-4 py-2 w-10" />
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
                                      p.closesPaymentItem,
                                    );
                                    const feeItem =
                                      typeof p.paymentItem === "object"
                                        ? p.paymentItem?.name ?? ""
                                        : (p.paymentItem as any) ?? "";
                                    return (
                                      <tr
                                        key={p._id}
                                        className="border-b border-gray-100 last:border-0"
                                      >
                                        <td className="px-4 py-2">
                                          <input
                                            type="checkbox"
                                            checked={selectedPaymentIds.includes(
                                              p._id,
                                            )}
                                            onChange={() => togglePayment(p._id)}
                                            className="w-4 h-4 border-2 border-gray-300 rounded cursor-pointer"
                                          />
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-700">
                                          {p.createdAt
                                            ? new Date(
                                                p.createdAt,
                                              ).toLocaleDateString()
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
                                            className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${badge.className}`}
                                          >
                                            {badge.label}
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                              <div className="flex justify-end gap-6 px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t border-gray-200">
                                <span>
                                  Billed:{" "}
                                  <span className="font-medium text-gray-700">
                                    {formatNaira(
                                      group.totalBilled ?? group.totalOwed ?? 0,
                                    )}
                                  </span>
                                </span>
                                <span>
                                  Shown here:{" "}
                                  <span className="font-medium text-gray-700">
                                    {formatNaira(group.paymentsTotalAmount ?? 0)}
                                  </span>
                                </span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">
                              No transactions match the current filters for this
                              student.
                            </p>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
