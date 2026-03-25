"use client";

import { MetricCard } from "@/components/metric-card";
import { Pagination } from "@/components/pagination";
import { useState, useMemo } from "react";
import { PaymentTable } from "../components/payment-table";
import { SearchInput } from "@/components/search-input";
import {
  PaymentStatus,
  PaymentStatusModal,
} from "../components/payment-status-modal";
import {
  useGetPaymentMetricsQuery,
  useGetTransactionsQuery,
} from "@/redux/api/transaction";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { formatNaira } from "@/utils/functions";
import { useGetSchoolMetricsQuery } from "@/redux/api/school";
import { CardSim, Currency } from "lucide-react";
import { useGetAllClassesQuery } from "@/redux/api/class";
import { ManualPaymentModal } from "../components/ManualPaymentModal";

const ITEMS_PER_PAGE = 10;

export default function PaymentView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] =
    useState<PaymentStatus>("FULLY_PAID");
  const [modalOpen, setModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const authstate = useSelector((state: RootState) => state.authState);
  const { data, isFetching, isLoading } = useGetTransactionsQuery(
    {
      schoolId: String(authstate.currentUser?.schoolId),
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      search: searchQuery,
    },
    { skip: !authstate.currentUser },
  );

  const {
    data: schoolMetrics,
    isFetching: isFetchingMetrics,
    isLoading: isLoadingMetrics,
  } = useGetSchoolMetricsQuery(
    {
      schoolId: String(authstate.currentUser?.schoolId),
    },
    { skip: !authstate.currentUser },
  );

  const { data: classItems } = useGetAllClassesQuery();

  const colors = ["green", "red", "gray"] as const;

  const schoolMetric =
    schoolMetrics?.data?.categories?.map((category, index) => ({
      ...category,
      color: colors[index],
    })) ?? [];

  const totalPages = data?.data?.meta?.totalPages ?? 1;


  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleViewList = (status: PaymentStatus) => {
    setSelectedStatus(status);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6 ">
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {schoolMetric?.map((category) => {
            return (
              <MetricCard
                key={category?.label}
                title={category.label}
                amount={formatNaira(category.totalAmount)}
                amountColor={category.color}
                studentCount={category.studentCount}
                onClick={() => handleViewList(category.category)}
              />
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="px-4 py-3 whitespace-nowrap bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium"
            >
              <CardSim />
              Add Payment
            </button>
            <SearchInput onSearch={handleSearch} placeholder="Search" />
          </div>
          <button className="px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export
          </button>
        </div>

        <PaymentTable
          data={data?.data}
          isLoading={isFetching || isLoading}
          classItems={classItems?.data ?? []}
        />

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
      <PaymentStatusModal
        isOpen={modalOpen}
        schoolData={schoolMetrics?.data?.categories}
        onClose={() => setModalOpen(false)}
        status={selectedStatus}
      />
      <ManualPaymentModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />
    </div>
  );
}
