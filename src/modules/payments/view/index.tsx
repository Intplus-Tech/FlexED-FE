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

interface PaymentRecord {
  id: string;
  timeDate: string;
  transactionId: string;
  studentName: string;
  class: string;
  amountPaid: string;
  percentRemaining: number;
  status: "Successful" | "Failed";
}

// Sample data
const SAMPLE_PAYMENTS: PaymentRecord[] = [
  {
    id: "1",
    timeDate: "2:34pm",
    transactionId: "32353213",
    studentName: "Chiamaka Adebayo",
    class: "SSS 3",
    amountPaid: "₦150,000",
    percentRemaining: 75,
    status: "Successful",
  },
  {
    id: "2",
    timeDate: "2:34pm",
    transactionId: "32353213",
    studentName: "Chiamaka Adebayo",
    class: "SSS 3",
    amountPaid: "₦150,000",
    percentRemaining: 75,
    status: "Failed",
  },
  {
    id: "3",
    timeDate: "Yesterday",
    transactionId: "32353213",
    studentName: "Chiamaka Adebayo",
    class: "SSS 3",
    amountPaid: "₦150,000",
    percentRemaining: 75,
    status: "Successful",
  },
  {
    id: "4",
    timeDate: "1:15pm",
    transactionId: "32353214",
    studentName: "John Okafor",
    class: "JSS 2",
    amountPaid: "₦75,000",
    percentRemaining: 50,
    status: "Successful",
  },
  {
    id: "5",
    timeDate: "12:45pm",
    transactionId: "32353215",
    studentName: "Zainab Hassan",
    class: "SSS 1",
    amountPaid: "₦200,000",
    percentRemaining: 90,
    status: "Successful",
  },
  {
    id: "6",
    timeDate: "11:20am",
    transactionId: "32353216",
    studentName: "Emeka Obi",
    class: "JSS 3",
    amountPaid: "₦120,000",
    percentRemaining: 60,
    status: "Failed",
  },
  {
    id: "7",
    timeDate: "10:30am",
    transactionId: "32353217",
    studentName: "Fatima Ahmed",
    class: "SSS 2",
    amountPaid: "₦180,000",
    percentRemaining: 80,
    status: "Successful",
  },
  {
    id: "8",
    timeDate: "9:15am",
    transactionId: "32353218",
    studentName: "David Ekpo",
    class: "JSS 1",
    amountPaid: "₦90,000",
    percentRemaining: 45,
    status: "Successful",
  },
  {
    id: "9",
    timeDate: "9:15am",
    transactionId: "32353218",
    studentName: "David Ekpo",
    class: "JSS 1",
    amountPaid: "₦90,000",
    percentRemaining: 45,
    status: "Successful",
  },
  {
    id: "10",
    timeDate: "9:15am",
    transactionId: "32353218",
    studentName: "David Ekpo",
    class: "JSS 1",
    amountPaid: "₦90,000",
    percentRemaining: 45,
    status: "Successful",
  },
  {
    id: "11",
    timeDate: "9:15am",
    transactionId: "32353218",
    studentName: "David Ekpo",
    class: "JSS 1",
    amountPaid: "₦90,000",
    percentRemaining: 45,
    status: "Successful",
  },
  {
    id: "12",
    timeDate: "9:15am",
    transactionId: "32353218",
    studentName: "David Ekpo",
    class: "JSS 1",
    amountPaid: "₦90,000",
    percentRemaining: 45,
    status: "Successful",
  },
];

const ITEMS_PER_PAGE = 10;

export default function PaymentView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] =
    useState<PaymentStatus>("FULLY_PAID");
  const [modalOpen, setModalOpen] = useState(false);
  const authstate = useSelector((state: RootState) => state.authState);
  const { data, isFetching, isLoading } = useGetTransactionsQuery(
    {
      schoolId: String(authstate.currentUser?.schoolId),
    },
    { skip: !authstate.currentUser }
  );

  const {
    data: schoolMetrics,
    isFetching: isFetchingMetrics,
    isLoading: isLoadingMetrics,
  } = useGetSchoolMetricsQuery(
    {
      schoolId: String(authstate.currentUser?.schoolId),
    },
    { skip: !authstate.currentUser }
  );

  const colors = ["green", "red", "gray"] as const;

  const schoolMetric =
    schoolMetrics?.data?.categories?.map((category, index) => ({
      ...category,
      color: colors[index],
    })) ?? [];

  const filteredPayments = useMemo(() => {
    if (!searchQuery.trim()) {
      return SAMPLE_PAYMENTS;
    }

    const query = searchQuery.toLowerCase();
    return SAMPLE_PAYMENTS.filter(
      (payment) =>
        payment.studentName.toLowerCase().includes(query) ||
        payment.transactionId.toLowerCase().includes(query) ||
        payment.class.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPayments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPayments, currentPage]);

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
          <SearchInput onSearch={handleSearch} placeholder="Search" />
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
          data={data?.data ?? []}
          isLoading={isFetching || isLoading}
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
        onClose={() => setModalOpen(false)}
        status={selectedStatus}
      />
    </div>
  );
}
