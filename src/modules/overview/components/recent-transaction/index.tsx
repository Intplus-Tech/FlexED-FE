/* eslint-disable @typescript-eslint/no-explicit-any */
import { RecentTransactionsProps } from "../../@types";
import TableLoader from "../../loader/table-loader";

export function RecentTransactions({
  transactions,
  isLoading = false,
}: RecentTransactionsProps) {
  if (isLoading) {
    <TableLoader />;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
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
                % Remaining
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  No recent transactions
                </td>
              </tr>
            ) : (
              transactions.map((transaction: any) => (
                <tr
                  key={transaction.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 border-2 border-gray-300 rounded cursor-pointer"
                      />
                      <span className="text-sm text-gray-900">
                        {transaction.time}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {transaction._id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {transaction.studentName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {transaction.class}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {transaction.amount}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {transaction.percentage}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                        transaction.status === "Successful"
                          ? "text-green-700 bg-green-50"
                          : "text-red-700 bg-red-50"
                      }`}
                    >
                      {transaction.status}
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
