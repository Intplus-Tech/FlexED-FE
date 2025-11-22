"use client";

import { useState } from "react";
import { SearchInput } from "@/components/search-input";
import { DownloadIcon, FilterIcon } from "@/icon/dashbaord";
import { FeeTable } from "../components/fee-table";

const mockFees = [
  {
    id: "1",
    name: "Tuition Fee",
    amount: "₦350,000",
    applicableTo: "SSS 3",
    tenure: "Per Term",
    status: true,
  },
  {
    id: "2",
    name: "Tuition Fee",
    amount: "₦350,000",
    applicableTo: "SSS 1",
    tenure: "Per Term",
    status: true,
  },
  {
    id: "3",
    name: "Tuition Fee",
    amount: "₦350,000",
    applicableTo: "SSS 2",
    tenure: "Per Term",
    status: true,
  },
  {
    id: "4",
    name: "Early Bird Discount",
    amount: "5%",
    applicableTo: "Universal",
    tenure: "Term, Session",
    status: true,
  },
  {
    id: "5",
    name: "Staff Discount",
    amount: "5%",
    applicableTo: "Universal",
    tenure: "Term, Session",
    status: true,
  },
];

export default function FeeManagementView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Fee Management</h1>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
            Create Fee
          </button>
          <button className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
            Create Plan
          </button>
        </div>

        <div className="flex items-center gap-4 flex-1 max-w-xl">
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

      <FeeTable
        fees={mockFees}
        isLoading={isLoading}
        searchQuery={searchQuery}
      />
    </div>
  );
}
