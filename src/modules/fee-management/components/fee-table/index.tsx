"use client";

import { useState } from "react";
import { Pagination } from "@/components/pagination";
import FeeTableLoader from "../../loader/fee-table-loader";

interface Fee {
  id: string;
  name: string;
  amount: string;
  applicableTo: string;
  tenure: string;
  status: boolean;
}

interface FeeTableProps {
  fees: Fee[];
  isLoading?: boolean;
  searchQuery?: string;
}

export function FeeTable({
  fees,
  isLoading = false,
  searchQuery = "",
}: FeeTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredFees = fees.filter((fee) => {
    const query = searchQuery.toLowerCase();
    return (
      fee.name.toLowerCase().includes(query) ||
      fee.applicableTo.toLowerCase().includes(query) ||
      fee.amount.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredFees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFees = filteredFees.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
                  Tenure
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedFees.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No fees found
                  </td>
                </tr>
              ) : (
                paginatedFees.map((fee) => (
                  <tr
                    key={fee.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {fee.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {fee.amount}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {fee.applicableTo}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {fee.tenure}
                    </td>
                    <td className="px-6 py-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          defaultChecked={fee.status}
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-sm text-gray-900 hover:text-purple-600 underline underline-offset-2">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredFees.length > itemsPerPage && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </>
  );
}
