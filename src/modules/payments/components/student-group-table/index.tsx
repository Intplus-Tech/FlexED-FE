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
  /** Serial-number offset so the S/N column stays continuous across pages. */
  startIndex?: number;
}

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
  startIndex = 0,
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

  const balanceClass = (balance: number) => {
    if (balance > 0) return "text-red-600";
    if (balance < 0) return "text-green-600";
    return "text-gray-500";
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 w-10" />
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 w-12">
                S/N
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Student Names
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Class
              </th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">
                Total Bill
              </th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">
                Amount Paid
              </th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">
                Balance Owing
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
              items.map((group, index) => {
                const studentId = group.student?._id ?? group.student?.id ?? "";
                const isOpen = !!expanded[studentId];
                const studentName = `${group.student?.firstName ?? ""} ${
                  group.student?.lastName ?? ""
                }`.trim();
                const totalBill = group.totalBilled ?? group.totalOwed ?? 0;
                const amountPaid =
                  group.totalAmountPaid ?? group.totalPaid ?? 0;
                const balanceOwing = totalBill - amountPaid;
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
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {startIndex + index + 1}
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
                      <td className="px-6 py-4 text-sm text-gray-900 text-right tabular-nums">
                        {formatNaira(totalBill)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right tabular-nums">
                        {formatNaira(amountPaid)}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm font-semibold text-right tabular-nums ${balanceClass(
                          balanceOwing,
                        )}`}
                      >
                        {formatNaira(balanceOwing)}
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
