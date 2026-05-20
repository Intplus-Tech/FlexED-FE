/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { TableSkeleton } from "../../Loader/table-loader";
import { ClassItem } from "@/@types/class";
import { TransactionsItems } from "@/@types/transaction";

import { Trash2 } from "lucide-react";

interface PaymentTableProps {
  data?: TransactionsItems;
  isLoading?: boolean;
  classItems: ClassItem[];
  selectedPaymentIds: string[];
  setSelectedPaymentIds: React.Dispatch<React.SetStateAction<string[]>>;
  onDelete?: (id: string) => void;
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
  selectedPaymentIds,
  setSelectedPaymentIds,
  onDelete,
}: PaymentTableProps) {

  console.log("Payment data:", data);
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedPaymentIds(data?.items?.map((row: any) => row._id) || []);
    } else {
      setSelectedPaymentIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedPaymentIds.includes(id)) {
      setSelectedPaymentIds(selectedPaymentIds.filter((pId) => pId !== id));
    } else {
      setSelectedPaymentIds([...selectedPaymentIds, id]);
    }
  };

  const getClassById = (classId: string | any) => {
    if (!classId) return "";
    if (typeof classId === 'object' && classId.name) return classId.name;
    const idToSearch = typeof classId === 'object' ? classId._id : classId;
    const classItem = classItems.find((item) => item._id === idToSearch);
    return classItem ? classItem.name : (typeof classId === 'string' ? classId : "");
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
                    checked={
                      data?.items?.length > 0 &&
                      data.items.every((item) =>
                        selectedPaymentIds.includes(item._id),
                      )
                    }
                    onChange={handleSelectAll}
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
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Action
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
                        checked={selectedPaymentIds.includes(payment._id)}
                        onChange={() => handleSelectRow(payment._id)}
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
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onDelete?.(payment._id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete payment"
                    >
                      <Trash2 size={18} />
                    </button>
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
