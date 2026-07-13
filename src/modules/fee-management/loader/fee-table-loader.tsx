import React from "react";
import { LogoLoader } from "@/components/ui/logo-loader";

const FeeTableLoader = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300"
                  disabled
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
            <tr>
              <td colSpan={7} className="px-6 py-12">
                <div className="flex justify-center">
                  <LogoLoader size={56} />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeeTableLoader;
