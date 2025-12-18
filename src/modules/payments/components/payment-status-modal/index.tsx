"use client";
import { PaymentCategoryItem } from "@/@types/transaction";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatNaira } from "@/utils/functions";

export type PaymentStatus = "FULLY_PAID" | "PARTIALLY_PAID" | "OVERDUE";

interface PaymentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: PaymentStatus;
  schoolData: PaymentCategoryItem[] | undefined;
}

export function PaymentStatusModal({
  isOpen,
  onClose,
  status,
  schoolData,
}: PaymentStatusModalProps) {
  console.log(schoolData, status, "schoolData");

  const studentData =
    schoolData?.filter((item) => item.category === status) ?? [];

  const formattedData = studentData?.flatMap((item) => item.students);

  const colors = {
    FULLY_PAID: "text-green-500",
    PARTIALLY_PAID: "text-yellow-500",
    OVERDUE: "text-red-500",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl! max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {studentData?.[0]?.label}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {/* Header Stats */}
          <div className="flex items-start justify-between gap-8">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  {studentData?.[0]?.label}
                </p>
                <p
                  className={`text-4xl font-bold ${
                    colors[studentData?.[0]?.category]
                  }`}
                >
                  {formatNaira(studentData?.[0]?.totalAmount)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 font-medium">
                No. of Students
              </p>
              <p className="text-2xl font-bold text-green-600">
                {studentData?.[0]?.studentCount}
              </p>
            </div>

            <div>
              <button className="px-8 py-3 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium whitespace-nowrap">
                Download List
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="border border-gray-200 rounded-lg overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input type="checkbox" className="w-4 h-4 cursor-pointer" />
                  </th>
                  {[
                    "StudentName",
                    "ClassName",
                    "AmountPaid",
                    "TransactionId",
                    "Time",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-700"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {formattedData?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      No data available
                    </td>
                  </tr>
                ) : (
                  formattedData?.map((row, idx) => (
                    <tr
                      key={idx}
                      className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">{row.studentName}</td>
                      <td className="px-6 py-4">{row.className}</td>
                      <td className="px-6 py-4">{row.amountPaid}</td>
                      <td className="px-6 py-4">{row.transactionId}</td>
                      <td className="px-6 py-4">{row.time}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
