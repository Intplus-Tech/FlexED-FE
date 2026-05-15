/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { TableSkeleton } from "../../Loader/table-loader";
import { ClassItem } from "@/@types/class";
import { TransactionsItems } from "@/@types/transaction";

interface PaymentTableProps {
  data?: TransactionsItems;
  isLoading?: boolean;
  classItems: ClassItem[];
}

export function PaymentTable({
  data = {
    items: [],
    meta: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
  },
  isLoading = false,
  classItems = [],
}: PaymentTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  console.log("Payment data:", data);
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(new Set(data?.items?.map((row: any) => row.id)));
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

  const getClassById = (classId: string) => {
    const classItem = classItems.find((item) => item._id === classId);
    return classItem ? classItem.name : "";
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 border-2 border-gray-300 rounded cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-600">
                    Time / Date
                  </span>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Transaction ID
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Student Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Class
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Amount Paid
              </th>

              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeleton />
            ) : data?.items?.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No payment records found
                </td>
              </tr>
            ) : (
              data?.items?.map((payment) => (
                <tr
                  key={payment._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 border-2 border-gray-300 rounded cursor-pointer"
                      />
                      <span className="text-sm text-gray-900">
                        {new Date(payment?.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {payment?.groupReference}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {payment?.student?.firstName +
                      " " +
                      payment?.student?.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {getClassById(payment?.student?.class)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {payment.amount.toLocaleString("en-NG", {
                      style: "currency",
                      currency: "NGN",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                        payment.status === "PAID"
                          ? "text-green-700 bg-green-50"
                          : payment.status === "PENDING"
                            ? "text-yellow-600 bg-yellow-50"
                            : "text-red-700 bg-red-50"
                      }`}
                    >
                      {payment.status}
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
