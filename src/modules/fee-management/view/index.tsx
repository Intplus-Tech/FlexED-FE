"use client";

import { useState } from "react";
import { SearchInput } from "@/components/search-input";
import { DownloadIcon, FilterIcon } from "@/icon/dashbaord";
import { FeeTable } from "../components/fee-table";
import {
  useGetPaymentCategoriesQuery,
  useGetPaymentListQuery,
} from "@/redux/api/transaction";
import { CreateFeeModal } from "../components/add-fee";
import { CreateFeeCategoryModal } from "../components/fee-category";
import { FeeCategoryTable } from "../components/fee-category-table";

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
  const [open, setOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const {
    data: feeCategories,
    isLoading: isLoadingCategories,
    isFetching: isFetchingCategories,
  } = useGetPaymentCategoriesQuery();

  const {
    data: fees,
    isFetching,
    isLoading: isLoadingFees,
  } = useGetPaymentListQuery();

  console.log(fees, "fees");

  const handleSubmit = (data: any) => {
    console.log("Fee created:", data);
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Fee Management</h1>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Create Fee
          </button>
          <button
            onClick={() => setCategoryOpen(true)}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Create Fee Category
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

      <FeeCategoryTable
        categories={feeCategories?.data ?? []}
        isLoading={isFetching || isLoadingFees}
        searchQuery={searchQuery}
      />

      <FeeTable
        fees={fees?.data ?? []}
        isLoading={isFetching || isLoadingFees}
        searchQuery={searchQuery}
      />

      <CreateFeeModal open={open} onOpenChange={setOpen} />

      <CreateFeeCategoryModal
        open={categoryOpen}
        onOpenChange={setCategoryOpen}
      />
    </div>
  );
}
