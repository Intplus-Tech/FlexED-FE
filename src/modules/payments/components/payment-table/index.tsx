"use client";

import { useState } from "react";
import { TableSkeleton } from "../../Loader/table-loader";

interface PaymentRow {
  id: string;
  timeDate: string;
  transactionId: string;
  studentName: string;
  class: string;
  amountPaid: string;
  percentRemaining: number;
  status: "Successful" | "Failed";
}

interface PaymentTableProps {
  data?: any;
  isLoading?: boolean;
}

export function PaymentTable({
  data = [],
  isLoading = false,
}: PaymentTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(new Set(data.map((row: any) => row.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedRows.size === data.length && data.length > 0}
                  className="w-5 h-5 cursor-pointer"
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                Time / Date
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                Transaction ID
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                Student Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                Class
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                Amount Paid
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                % Remaining
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeleton />
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No payment records found
                </td>
              </tr>
            ) : (
              data.map((row: any) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.id)}
                      onChange={() => handleSelectRow(row.id)}
                      className="w-5 h-5 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {row.timeDate}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {row.transactionId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {row.studentName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {row.class}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {row.amountPaid}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {row.percentRemaining}%
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        row.status === "Successful"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
