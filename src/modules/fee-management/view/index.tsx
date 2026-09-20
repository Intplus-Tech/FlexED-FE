"use client";

import { useMemo, useState } from "react";

import { ExportButton } from "@/components/export-button";
import {
  useGetPaymentCategoriesQuery,
  useGetPaymentListQuery,
} from "@/redux/api/transaction";

import { CreateFeeModal } from "../components/add-fee";
import { CreateFeeCategoryModal } from "../components/fee-category";
import { FeeCategoryTable } from "../components/fee-category-table";
import { FeeTable } from "../components/fee-table";

export default function FeeManagementView() {
  const [feesSearchQuery, setFeesSearchQuery] = useState("");
  const [categoriesSearchQuery, setCategoriesSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: feeCategories,
    isLoading: isLoadingCategories,
    isFetching: isFetchingCategories,
    isError: isCategoriesError,
    error: categoriesError,
    refetch: refetchCategories,
  } = useGetPaymentCategoriesQuery({
    search: categoriesSearchQuery,
    limit: 100,
  });

  const {
    data: fees,
    isFetching,
    isLoading: isLoadingFees,
    isError: isFeesError,
    error: feesError,
    refetch: refetchFees,
  } = useGetPaymentListQuery({
    search: feesSearchQuery,
    limit: pageSize,
    page: pageIndex + 1,
  });

  const feeItems = fees?.data?.items ?? [];

  const exportData = useMemo(
    () =>
      feeItems.map((fee) => ({
        "Fee Name": fee.name,
        Amount: fee.amount,
        "Applicable To": fee.applicableTo,
        Description: fee.description,
        Tenure: fee.period,
      })),
    [feeItems]
  );

  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Fee Management</h1>
          <div className="flex items-center gap-3">
            <ExportButton
              data={exportData}
              filename="Fee_Structure"
              sheetName="Fees"
              disabled={exportData.length === 0}
            />
            <button
              onClick={() => setOpen(true)}
              className="cursor-pointer rounded-lg bg-gray-900 px-6 py-2.5 text-white transition-colors hover:bg-gray-800"
            >
              Create Fee
            </button>
          </div>
        </div>

        <FeeTable
          fees={feeItems}
          isLoading={isLoadingFees}
          isFetching={isFetching}
          isError={isFeesError}
          error={feesError}
          searchQuery={feesSearchQuery}
          totalCount={fees?.data?.meta?.total ?? 0}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={setPageIndex}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPageIndex(0);
          }}
          onSearch={(term) => {
            setFeesSearchQuery(term);
            setPageIndex(0);
          }}
          onRefresh={refetchFees}
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Fee Category</h1>
          <button
            onClick={() => setCategoryOpen(true)}
            className="cursor-pointer rounded-lg bg-gray-900 px-6 py-2.5 text-white transition-colors hover:bg-gray-800"
          >
            Create Fee Category
          </button>
        </div>

        <FeeCategoryTable
          categories={feeCategories?.data?.items ?? []}
          isLoading={isLoadingCategories}
          isFetching={isFetchingCategories}
          isError={isCategoriesError}
          error={categoriesError}
          searchQuery={categoriesSearchQuery}
          onSearch={setCategoriesSearchQuery}
          onRefresh={refetchCategories}
        />
      </section>

      <CreateFeeModal open={open} onOpenChange={setOpen} />

      <CreateFeeCategoryModal
        open={categoryOpen}
        onOpenChange={setCategoryOpen}
      />
    </div>
  );
}
