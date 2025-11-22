"use client";

import StudentTableLoader from "../../Loader/table-loader";

interface Student {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  amountFee: string;
  paidTD: string;
  balance: string;
}

interface StudentTableProps {
  students: Student[];
  isLoading?: boolean;
}

export function StudentTable({
  students,
  isLoading = false,
}: StudentTableProps) {
  if (isLoading) {
    <StudentTableLoader />;
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
                    Student ID
                  </span>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Student Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Class
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Amount Fee
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Paid TD
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Balance
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((student) => (
              <tr
                key={student.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 border-2 border-gray-300 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-900">
                      {student.studentId}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {student.studentName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {student.class}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {student.amountFee}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {student.paidTD}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {student.balance}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button className="text-sm text-gray-700 hover:text-gray-900 underline">
                      View
                    </button>
                    <span className="text-gray-300">|</span>
                    <button className="text-sm text-gray-700 hover:text-gray-900 underline">
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
