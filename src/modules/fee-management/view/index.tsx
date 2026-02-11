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

export default function FeeManagementView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const {
    data: feeCategories,
    isLoading: isLoadingCategories,
    isFetching: isFetchingCategories,
  } = useGetPaymentCategoriesQuery();

  console.log("fee categories", feeCategories);

  const {
    data: fees,
    isFetching,
    isLoading: isLoadingFees,
  } = useGetPaymentListQuery();

  console.log("fees", fees);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Fee Category</h1>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
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
        categories={feeCategories?.data.items ?? []}
        isLoading={isLoadingCategories || isFetchingCategories}
        searchQuery={searchQuery}
      />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            Fee Management
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Create Fee
            </button>
          </div>
        </div>
        <FeeTable
          fees={fees?.data.items ?? []}
          isLoading={isFetching || isLoadingFees}
          searchQuery={searchQuery}
        />
      </div>

      <CreateFeeModal open={open} onOpenChange={setOpen} />

      <CreateFeeCategoryModal
        open={categoryOpen}
        onOpenChange={setCategoryOpen}
      />
    </div>
  );
}
