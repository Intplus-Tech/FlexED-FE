"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type PaymentStatus = "FULLY_PAID" | "PARTIALLY_PAID" | "OVERDUE";

interface PaymentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: PaymentStatus;
}

interface ModalConfig {
  title: string;
  amount: string;
  amountColor: string;
  studentCount: number;
  tableHeaders: string[];
  tableData: Record<string, string>[];
}

const MODAL_CONFIGS: Record<PaymentStatus, ModalConfig> = {
  FULLY_PAID: {
    title: "Fully Paid",
    amount: "₦24,082,675.53",
    amountColor: "text-green-600",
    studentCount: 284,
    tableHeaders: [
      "Time / Date",
      "Transaction ID",
      "Student Name",
      "Class",
      "Amount Paid",
    ],
    tableData: [
      {
        timeDate: "2:34pm",
        transactionId: "32353213",
        studentName: "Chiamaka Adebayo",
        class: "SSS 3",
        amountPaid: "₦150,000",
      },
      {
        timeDate: "2:34pm",
        transactionId: "32353213",
        studentName: "Chiamaka Adebayo",
        class: "SSS 3",
        amountPaid: "₦150,000",
      },
      {
        timeDate: "Yesterday",
        transactionId: "32353213",
        studentName: "Chiamaka Adebayo",
        class: "SSS 3",
        amountPaid: "₦150,000",
      },
      {
        timeDate: "2 days ago",
        transactionId: "32353214",
        studentName: "Aisha Mohammed",
        class: "JSS 1",
        amountPaid: "₦200,000",
      },
      {
        timeDate: "3 days ago",
        transactionId: "32353215",
        studentName: "Emeka Okoro",
        class: "SSS 2",
        amountPaid: "₦180,000",
      },
    ],
  },
  PARTIALLY_PAID: {
    title: "Partially Paid",
    amount: "₦2,317,748.45",
    amountColor: "text-red-600",
    studentCount: 284,
    tableHeaders: [
      "Time / Date",
      "Transaction ID",
      "Student Name",
      "Class",
      "Amount Paid",
      "Outstanding",
    ],
    tableData: [
      {
        timeDate: "2:34pm",
        transactionId: "32353213",
        studentName: "Chiamaka Adebayo",
        class: "SSS 3",
        amountPaid: "₦150,000",
        outstanding: "₦250,000",
      },
      {
        timeDate: "2:34pm",
        transactionId: "32353213",
        studentName: "Chiamaka Adebayo",
        class: "SSS 3",
        amountPaid: "₦150,000",
        outstanding: "₦50,000",
      },
      {
        timeDate: "Yesterday",
        transactionId: "32353213",
        studentName: "Chiamaka Adebayo",
        class: "SSS 3",
        amountPaid: "₦150,000",
        outstanding: "₦100,000",
      },
      {
        timeDate: "2 days ago",
        transactionId: "32353214",
        studentName: "Zainab Hassan",
        class: "JSS 2",
        amountPaid: "₦120,000",
        outstanding: "₦80,000",
      },
      {
        timeDate: "3 days ago",
        transactionId: "32353215",
        studentName: "David Ekpo",
        class: "SSS 1",
        amountPaid: "₦175,000",
        outstanding: "₦175,000",
      },
    ],
  },
  OVERDUE: {
    title: "Outstanding",
    amount: "₦5,401,095",
    amountColor: "text-gray-600",
    studentCount: 132,
    tableHeaders: ["Overdue", "Student Name", "Class", "Amount"],
    tableData: [
      {
        overdue: "4",
        studentName: "Chiamaka Adebayo",
        class: "SSS 3",
        amount: "₦250,000",
      },
      {
        overdue: "2",
        studentName: "Chiamaka Adebayo",
        class: "SSS 3",
        amount: "₦50,000",
      },
      {
        overdue: "8",
        studentName: "Chiamaka Adebayo",
        class: "SSS 3",
        amount: "₦100,000",
      },
      {
        overdue: "5",
        studentName: "Fatima Ahmed",
        class: "JSS 3",
        amount: "₦150,000",
      },
      {
        overdue: "10",
        studentName: "John Okafor",
        class: "SSS 2",
        amount: "₦300,000",
      },
    ],
  },
};

export function PaymentStatusModal({
  isOpen,
  onClose,
  status,
}: PaymentStatusModalProps) {
  const config = MODAL_CONFIGS[status];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl! max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {config.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {/* Header Stats */}
          <div className="flex items-start justify-between gap-8">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  {config.title}
                </p>
                <p className={`text-4xl font-bold ${config.amountColor}`}>
                  {config.amount}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 font-medium">
                No. of Students
              </p>
              <p className="text-2xl font-bold text-green-600">
                {config.studentCount}
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
                  {config.tableHeaders.map((header) => (
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
                {config.tableData.map((row, idx) => (
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
                    {config.tableHeaders.map((header) => {
                      const key = header
                        .toLowerCase()
                        .replace(/\s+/g, "")
                        .replace(/\//g, "");
                      return (
                        <td
                          key={header}
                          className="px-6 py-4 text-sm text-gray-900"
                        >
                          {row[key as keyof typeof row] || "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
