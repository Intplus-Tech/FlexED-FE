/* eslint-disable @typescript-eslint/no-explicit-any */
import { RecentTransactionsProps } from "../../@types";
import TableLoader from "../../loader/table-loader";

export function RecentTransactions({
  transactions,
  isLoading = false,
  classItems,
}: RecentTransactionsProps) {



  if (isLoading) {
    <TableLoader />;
  }

  const getClassById = (classId: string | any) => {
    if (!classId) return "";
    if (typeof classId === 'object' && classId.name) return classId.name;
    const idToSearch = typeof classId === 'object' ? classId._id : classId;
    const classItem = classItems.find((item) => item._id === idToSearch);
    return classItem ? classItem.name : (typeof classId === 'string' ? classId : "");
  };

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
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {transactions?.items?.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  No recent transactions
                </td>
              </tr>
            ) : (
              transactions?.items?.slice(0, 5).map((transaction) => (
                <tr
                  key={transaction._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 border-2 border-gray-300 rounded cursor-pointer"
                      />
                      <span className="text-sm text-gray-900">
                        {new Date(transaction?.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {transaction?.groupReference}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {transaction?.student?.firstName + " " + transaction?.student?.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {getClassById(transaction?.student?.class)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {transaction.amount.toLocaleString("en-NG", {
                      style: "currency",
                      currency: "NGN",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${transaction.status === "PAID"
                        ? "text-green-700 bg-green-50"
                        : transaction.status === "PENDING"
                          ? "text-yellow-600 bg-yellow-50"
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
  )
}
