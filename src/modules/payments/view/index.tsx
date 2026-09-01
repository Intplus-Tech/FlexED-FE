"use client";

import { MetricCard } from "@/components/metric-card";
import { Pagination } from "@/components/pagination";
import { useState, useMemo, useRef, useEffect } from "react";
import {
  StudentGroupTable,
  resolveClassName,
} from "../components/student-group-table";
import { SearchInput } from "@/components/search-input";
import {
  PaymentStatus,
  PaymentStatusModal,
} from "../components/payment-status-modal";
import {
  useGetTransactionsByStudentQuery,
  useGetPaymentCategoriesQuery,
  useBulkDeleteTransactionsMutation,
} from "@/redux/api/transaction";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { formatNaira } from "@/utils/functions";
import { useGetSchoolMetricsQuery } from "@/redux/api/school";
import { CardSim } from "lucide-react";
import { useGetAllClassesQuery } from "@/redux/api/class";
import { ManualPaymentModal } from "../components/ManualPaymentModal";
import { ExportButton } from "@/components/export-button";
import { useGetAllAcademicSessionQuery } from "@/redux/api/academicSession";

import { usePermission } from "@/utils/permissions";
import { DeleteModal } from "@/components/delete-modal";
import { showerror, showsuccess } from "@/utils/toast";

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
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const authstate = useSelector((state: RootState) => state.authState);

  const { data: academicSessions } = useGetAllAcademicSessionQuery();
  const { data: categories } = useGetPaymentCategoriesQuery();
  const { data: classItems } = useGetAllClassesQuery();

  // Default the Academic Period filter to whichever session is currently
  // active, once — a user's own selection afterward should stick.
  const hasSetDefaultPeriodRef = useRef(false);
  useEffect(() => {
    if (hasSetDefaultPeriodRef.current) return;
    const activeSession = academicSessions?.data?.items?.find((s) => s.isActive);
    if (activeSession) {
      setFilters((prev) => ({ ...prev, academicPeriod: activeSession._id }));
      hasSetDefaultPeriodRef.current = true;
    }
  }, [academicSessions]);

  const { data, isFetching, isLoading } = useGetTransactionsByStudentQuery(
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
  const [bulkDeleteTransactions, { isLoading: isBulkDeleting }] =
    useBulkDeleteTransactionsMutation();

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

  const studentGroups = useMemo(
    () => data?.data?.items ?? [],
    [data],
  );
  const totalPages = data?.data?.meta?.totalPages ?? 1;
  const rowOffset = (currentPage - 1) * ITEMS_PER_PAGE;

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  // Export: the class fee register — one row per student (main table rows
  // only, not the expanded per-payment sub-rows), same columns/headers as the
  // on-screen table. The serial-number column has a blank header to mirror the
  // register. Balance Owing is signed: negative means overpaid / in credit.
  const exportData = useMemo(() => {
    return studentGroups.map((group, index) => {
      const totalBill = group.totalBilled ?? group.totalOwed ?? 0;
      const amountPaid = group.totalAmountPaid ?? group.totalPaid ?? 0;
      return {
        " ": rowOffset + index + 1,
        "STUDENT NAMES": `${group.student?.firstName ?? ""} ${
          group.student?.lastName ?? ""
        }`.trim(),
        CLASS: resolveClassName(group.student?.class, classItems?.data ?? []),
        "TOTAL BILL": totalBill,
        "AMOUNT PAID": amountPaid,
        "BALANCE OWING": totalBill - amountPaid,
      };
    });
  }, [studentGroups, classItems, rowOffset]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleViewList = (status: PaymentStatus) => {
    setSelectedStatus(status);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const res = await bulkDeleteTransactions({
        transactionIds: selectedPaymentIds,
      }).unwrap();
      showsuccess(res.message || "Payments deleted successfully");
      setSelectedPaymentIds([]);
      setIsDeleteModalOpen(false);
    } catch (error: any) {
      showerror(error?.data?.message || "Failed to delete payment(s)");
    }
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
            disabled={exportData.length === 0}
            filename="Payments_By_Student"
            sheetName="By Student"
          />
        </div>

        {selectedPaymentIds.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-purple-50 border border-purple-100 rounded-xl p-4 sm:px-6 animate-in fade-in slide-in-from-top-4 duration-300 gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-purple-900 bg-purple-100 px-3 py-1 rounded-full">
                {selectedPaymentIds.length} Selected
              </span>
              <span className="text-sm text-purple-700 font-medium">
                payment{selectedPaymentIds.length > 1 ? "s" : ""} chosen for bulk actions
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all active:scale-95"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedPaymentIds([])}
                className="w-full sm:w-auto px-4 py-2.5 text-gray-500 hover:text-gray-700 text-sm font-semibold transition-colors text-center cursor-pointer"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

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

        <StudentGroupTable
          items={studentGroups}
          isLoading={isFetching || isLoading}
          classItems={classItems?.data ?? []}
          selectedPaymentIds={selectedPaymentIds}
          setSelectedPaymentIds={setSelectedPaymentIds}
          startIndex={rowOffset}
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
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Selected Payments"
        description={`Are you sure you want to delete these ${selectedPaymentIds.length} payment${
          selectedPaymentIds.length > 1 ? "s" : ""
        }? This action cannot be undone.`}
        isLoading={isBulkDeleting}
      />
    </div>
  );
}
