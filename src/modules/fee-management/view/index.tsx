"use client";

import { useState } from "react";
import { SearchInput } from "@/components/search-input";
import { FeeTable } from "../components/fee-table";
import { Pagination } from "@/components/pagination";
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    data: feeCategories,
    isLoading: isLoadingCategories,
    isFetching: isFetchingCategories,
  } = useGetPaymentCategoriesQuery({ search: categoriesSearchQuery,limit:100 });

  const {
    data: fees,
    isFetching,
    isLoading: isLoadingFees,
  } = useGetPaymentListQuery({
    search: feesSearchQuery,
    limit: itemsPerPage,
    page: currentPage,
  });

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = fees?.data?.meta?.totalPages || 1;

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
          <SearchInput
            onSearch={(query) => {
              setFeesSearchQuery(query);
              setCurrentPage(1);
            }}
            placeholder="Search Fees"
          />
        </div>

        <FeeTable
          fees={fees?.data.items ?? []}
          isLoading={isFetching || isLoadingFees}
          searchQuery={feesSearchQuery}
        />

        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <h1 className="text-2xl font-semibold text-gray-900 mt-12">
        Fee Category
      </h1>

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
          <SearchInput
            onSearch={setCategoriesSearchQuery}
            placeholder="Search Categories"
          />
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
