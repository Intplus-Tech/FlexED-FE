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
import { ExportButton } from "@/components/export-button";
import { useGetAllAcademicSessionQuery } from "@/redux/api/academicSession";
import { useGetPaymentCategoriesQuery } from "@/redux/api/transaction";
import { usePermission } from "@/utils/permissions";

const ITEMS_PER_PAGE = 10;

export default function PaymentView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    academicPeriod: "",
    classId: "",
    status: "",
    category: "",
  });

  const [selectedStatus, setSelectedStatus] =
    useState<PaymentStatus>("FULLY_PAID");
  const [modalOpen, setModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const authstate = useSelector((state: RootState) => state.authState);

  const { data: academicSessions } = useGetAllAcademicSessionQuery();
  const { data: categories } = useGetPaymentCategoriesQuery();
  const { data: classItems } = useGetAllClassesQuery();

  const { data, isFetching, isLoading } = useGetTransactionsQuery(
    {
      schoolId: String(authstate.currentUser?.schoolId),
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      search: searchQuery,
      ...filters,
    },
    { skip: !authstate.currentUser },
  );

  const { isStaff } = usePermission();

  const { data: schoolMetrics } = useGetSchoolMetricsQuery(
    {
      schoolId: String(authstate.currentUser?.schoolId),
    },
    { skip: !authstate.currentUser || isStaff },
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "FULLY_PAID":
        return "green";
      case "PARTIALLY_PAID":
        return "yellow";
      case "OVERDUE":
        return "red";
      default:
        return "gray";
    }
  };

  const schoolMetric =
    schoolMetrics?.data?.categories?.map((category) => ({
      ...category,
      color: getCategoryColor(category.category) as
        | "green"
        | "red"
        | "gray"
        | "yellow",
    })) ?? [];

  const totalPages = data?.data?.meta?.totalPages ?? 1;

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const exportData = useMemo(() => {
    return (
      data?.data?.items?.map((payment: any) => ({
        Date: new Date(payment?.createdAt).toLocaleDateString(),
        "Transaction ID": payment?.groupReference,
        "Student Name":
          payment?.student?.firstName + " " + payment?.student?.lastName,
        Class:
          classItems?.data?.find((c: any) => c._id === payment?.student?.class)
            ?.name || payment?.student?.class,
        "Amount Paid": payment.amount,
        Status: payment.status,
      })) || []
    );
  }, [data, classItems]);

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

        {!isStaff && (
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
        )}

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
          <ExportButton
            data={exportData}
            filename="Payments_Transactions"
            sheetName="Transactions"
          />
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase ml-1">
              Academic Period
            </label>
            <select
              value={filters.academicPeriod}
              onChange={(e) =>
                handleFilterChange("academicPeriod", e.target.value)
              }
              className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
            >
              <option value="">All Periods</option>
              {academicSessions?.data?.items?.map((session) => (
                <option key={session._id} value={session._id}>
                  {session.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase ml-1">
              Class
            </label>
            <select
              value={filters.classId}
              onChange={(e) => handleFilterChange("classId", e.target.value)}
              className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
            >
              <option value="">All Classes</option>
              {classItems?.data?.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase ml-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
            >
              <option value="">All Statuses</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase ml-1">
              Fee Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
            >
              <option value="">All Categories</option>
              {categories?.data?.items?.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
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
