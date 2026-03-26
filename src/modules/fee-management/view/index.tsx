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

import { useMemo } from "react";
import { ExportButton } from "@/components/export-button";

export default function FeeManagementView() {
  const [feesSearchQuery, setFeesSearchQuery] = useState("");
  const [categoriesSearchQuery, setCategoriesSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const {
    data: feeCategories,
    isLoading: isLoadingCategories,
    isFetching: isFetchingCategories,
  } = useGetPaymentCategoriesQuery({ search: categoriesSearchQuery });

  const {
    data: fees,
    isFetching,
    isLoading: isLoadingFees,
  } = useGetPaymentListQuery({ search: feesSearchQuery });

  const exportData = useMemo(() => {
    return (
      fees?.data?.items?.map((fee: any) => ({
        "Fee Name": fee.name,
        Amount: fee.amount,
        "Applicable To": fee.applicableTo,
        Description: fee.description,
        Tenure: fee.period,
      })) || []
    );
  }, [fees]);

  return (
    <div className="space-y-6">
      <div className="mb-6!">
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
            <ExportButton
              data={exportData}
              filename="Fee_Structure"
              sheetName="Fees"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4 max-w-xl">
          <SearchInput onSearch={setFeesSearchQuery} placeholder="Search Fees" />
        </div>

        <FeeTable
          fees={fees?.data.items ?? []}
          isLoading={isFetching || isLoadingFees}
          searchQuery={feesSearchQuery}
        />
      </div>

      <h1 className="text-2xl font-semibold text-gray-900 mt-12">Fee Category</h1>

      <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCategoryOpen(true)}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Create Fee Category
          </button>
        </div>

        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <SearchInput onSearch={setCategoriesSearchQuery} placeholder="Search Categories" />
        </div>
      </div>
      <FeeCategoryTable
        categories={feeCategories?.data.items ?? []}
        isLoading={isLoadingCategories || isFetchingCategories}
        searchQuery={categoriesSearchQuery}
      />

      <CreateFeeModal open={open} onOpenChange={setOpen} />

      <CreateFeeCategoryModal
        open={categoryOpen}
        onOpenChange={setCategoryOpen}
      />
    </div>
  );
}
