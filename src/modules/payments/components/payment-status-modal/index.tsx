"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { PaymentCategoryItem, PaymentStudentItem } from "@/@types/transaction";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import { TableEmptyState } from "@/components/ui/table-empty-state";
import { ExportButton } from "@/components/export-button";
import { formatNaira } from "@/utils/functions";

export type PaymentStatus = "FULLY_PAID" | "PARTIALLY_PAID" | "OVERDUE";

interface PaymentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: PaymentStatus;
  schoolData: PaymentCategoryItem[] | undefined;
}

const COLORS: Record<PaymentStatus, string> = {
  FULLY_PAID: "text-green-500",
  PARTIALLY_PAID: "text-yellow-500",
  OVERDUE: "text-red-500",
};

// A stable reference for the "no category yet" case — `category?.students ?? []`
// would otherwise hand back a fresh array every render and defeat the useMemo
// hooks below it.
const EMPTY_STUDENTS: PaymentStudentItem[] = [];

export function PaymentStatusModal({
  isOpen,
  onClose,
  status,
  schoolData,
}: PaymentStatusModalProps) {
  const category = useMemo(
    () => schoolData?.find((item) => item.category === status),
    [schoolData, status]
  );
  const students = useMemo(
    () => category?.students ?? EMPTY_STUDENTS,
    [category]
  );

  const columns = useMemo<ColumnDef<PaymentStudentItem, unknown>[]>(
    () => [
      {
        id: "studentName",
        accessorKey: "studentName",
        header: "Student Name",
        cell: ({ row }) => (
          <span className="font-medium text-gray-900">
            {row.original.studentName}
          </span>
        ),
      },
      {
        id: "className",
        accessorKey: "className",
        header: "Class",
        cell: ({ row }) => row.original.className || "—",
      },
      {
        id: "amountBilled",
        accessorKey: "amountBilled",
        header: "Billed",
        cell: ({ row }) => formatNaira(row.original.amountBilled),
      },
      {
        id: "amountPaid",
        accessorKey: "amountPaid",
        header: "Paid",
        cell: ({ row }) => formatNaira(row.original.amountPaid),
      },
      {
        id: "arrears",
        accessorKey: "arrears",
        header: "Arrears",
        cell: ({ row }) =>
          row.original.arrears > 0 ? (
            <span className="text-amber-600">
              {formatNaira(row.original.arrears)}
            </span>
          ) : (
            "—"
          ),
      },
      {
        id: "amountOutstanding",
        accessorKey: "amountOutstanding",
        header: "Outstanding",
        cell: ({ row }) => (
          <span
            className={
              row.original.amountOutstanding > 0
                ? "font-semibold text-red-600"
                : "text-gray-500"
            }
          >
            {formatNaira(row.original.amountOutstanding)}
          </span>
        ),
      },
    ],
    []
  );

  const exportData = useMemo(
    () =>
      students.map((s) => ({
        "Student Name": s.studentName,
        Class: s.className ?? "",
        Billed: s.amountBilled,
        Paid: s.amountPaid,
        Arrears: s.arrears,
        Outstanding: s.amountOutstanding,
      })),
    [students]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl! max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {category?.label}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-sm text-gray-600 font-medium">
                No. of Students
              </p>
              <p className={`text-4xl font-bold ${COLORS[status]}`}>
                {category?.studentCount ?? 0}
              </p>
            </div>

            <div className="flex gap-8">
              <div>
                <p className="text-sm text-gray-600 font-medium">Collected</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatNaira(category?.totalPaid ?? 0)}
                </p>
              </div>
              {(category?.totalArrears ?? 0) > 0 && (
                <div>
                  <p className="text-sm text-gray-600 font-medium">Arrears</p>
                  <p className="text-xl font-bold text-amber-600">
                    {formatNaira(category?.totalArrears ?? 0)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Outstanding
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {formatNaira(category?.totalOutstanding ?? 0)}
                </p>
              </div>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={students}
            pageSize={10}
            action={
              <ExportButton
                data={exportData}
                disabled={students.length === 0}
                filename={`Payments_${category?.label ?? status}`}
                sheetName="Students"
              />
            }
            empty={
              <TableEmptyState
                title="No students in this category"
                description=""
              />
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
