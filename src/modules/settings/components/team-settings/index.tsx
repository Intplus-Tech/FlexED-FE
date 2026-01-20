"use client";

import { useState } from "react";
import { SearchInput } from "@/components/search-input";
import { DownloadIcon, FilterIcon } from "@/icon/dashbaord";
import { useGetAllStaffQuery } from "@/redux/api/school";

interface TeamMember {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
}

export function TeamSettingsTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data,
    isLoading: isLoadingStaff,
    isFetching: isFetchingStaff,
  } = useGetAllStaffQuery({
    search: searchQuery,
  });

  const [teamMembers] = useState<TeamMember[]>([]);

  const filteredMembers = teamMembers.filter((member) => {
    const query = searchQuery.toLowerCase();
    return (
      member.firstName.toLowerCase().includes(query) ||
      member.lastName.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      member.userId.includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <button className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
          Add New
        </button>
        <div className="flex items-center gap-4 flex-1 max-w-2xl">
          <SearchInput onSearch={setSearchQuery} placeholder="Search" />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FilterIcon className="w-5 h-5" />
            <span className="text-sm text-gray-700">Filter</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
            <DownloadIcon className="w-5 h-5" />
            <span className="text-sm">Export</span>
          </button>
        </div>
      </div>

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
                  User ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  First Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Last Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Email Address
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Password
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center h-60">
                    No members found
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {member.userId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {member.firstName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {member.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      *********
                    </td>
                    <td className="px-6 py-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          defaultChecked={member.isActive}
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
