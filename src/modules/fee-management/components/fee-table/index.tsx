"use client";

import { useState } from "react";
import FeeTableLoader from "../../loader/fee-table-loader";
import { PaymentItem } from "@/@types/transaction";

interface Fee {
  id: string;
  name: string;
  amount: string;
  applicableTo: string;
  tenure: string;
  status: boolean;
}

interface FeeTableProps {
  fees: PaymentItem[];
  isLoading?: boolean;
  searchQuery?: string;
}

export function FeeTable({
  fees,
  isLoading = false,
  searchQuery = "",
}: FeeTableProps) {
  if (isLoading) {
    return <FeeTableLoader />;
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Fee/Payment Item
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Applicable To
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Tenure
                </th>
                {/* <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Status
                </th> */}
                {/* <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Action
                </th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {fees?.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No fees found
                  </td>
                </tr>
              ) : (
                fees?.map((fee) => (
                  <tr
                    key={fee._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {fee?.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {fee.amount}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {fee?.applicableTo}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {fee?.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {fee?.period}
                    </td>
                    {/* <td className="px-6 py-4">{fee?.status}</td> */}
                    {/* <td className="px-6 py-4">
                      <button className="text-sm text-gray-900 hover:text-purple-600 underline underline-offset-2">
                        Edit
                      </button>
                    </td> */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* {filteredFees.length > itemsPerPage && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )} */}
    </>
  );
}
