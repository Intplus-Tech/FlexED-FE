"use client";

import { MetricCard } from "@/components/metric-card";
import { useState, useMemo, useRef, useEffect } from "react";
import {
  StudentGroupTable,
  resolveClassName,
} from "../components/student-group-table";
import {
  PaymentStatus,
  PaymentStatusModal,
} from "../components/payment-status-modal";
import {
  useGetTransactionsByStudentQuery,
  useLazyGetTransactionsByStudentQuery,
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
import { buildFeeRegister } from "../export-register";
import { useGetAllAcademicSessionQuery } from "@/redux/api/academicSession";

import { usePermission } from "@/utils/permissions";
import { DeleteModal } from "@/components/delete-modal";
import { showerror, showsuccess } from "@/utils/toast";

export default function PaymentView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({
    academicPeriod: "",
    classId: "",
    status: "",
    category: "",
  });
  const [onlyWithTransactions, setOnlyWithTransactions] = useState(false);

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
  // active, and keep following it when a new term is activated — a page left
  // open across a term change shouldn't strand an admin on a term that's no
  // longer current. Tracks the id we last defaulted *to*, not a one-shot flag,
  // so this re-fires on every activation; a user who has explicitly picked a
  // different (non-default) term keeps their own choice.
  const defaultedPeriodIdRef = useRef<string | null>(null);
  useEffect(() => {
    const activeSession = academicSessions?.data?.items?.find((s) => s.isActive);
    if (!activeSession || activeSession._id === defaultedPeriodIdRef.current) {
      return;
    }
    setFilters((prev) =>
      prev.academicPeriod === "" ||
      prev.academicPeriod === defaultedPeriodIdRef.current
        ? { ...prev, academicPeriod: activeSession._id }
        : prev,
    );
    defaultedPeriodIdRef.current = activeSession._id;
  }, [academicSessions]);

  const { data, isFetching, isLoading, isError, error, refetch } =
    useGetTransactionsByStudentQuery(
      {
        schoolId: String(authstate.currentUser?.schoolId),
        page: pageIndex + 1,
        limit: pageSize,
        search: searchQuery,
        onlyWithTransactions,
        ...filters,
      },
      { skip: !authstate.currentUser },
    );

  const [fetchAllStudentGroups] = useLazyGetTransactionsByStudentQuery();

  const { isStaff } = usePermission();
  const [bulkDeleteTransactions, { isLoading: isBulkDeleting }] =
    useBulkDeleteTransactionsMutation();

  const { data: schoolMetrics } = useGetSchoolMetricsQuery(
    {
      schoolId: String(authstate.currentUser?.schoolId),
      academicPeriod: filters.academicPeriod,
    },
    { skip: !authstate.currentUser || isStaff },
  );

  const schoolMetric = schoolMetrics?.data?.categories ?? [];

  const studentGroups = useMemo(
    () => data?.data?.items ?? [],
    [data],
  );
  const totalCount = data?.data?.meta?.total ?? 0;

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPageIndex(0);
  };

  const toExportRows = (groups: typeof studentGroups) =>
    buildFeeRegister(groups, (group) =>
      resolveClassName(group.student?.class, classItems?.data ?? [])
    );

  // Fallback for the initial render; the click handler below replaces it with
  // every matching student, not just the page on screen.
  const exportData = useMemo(
    () => toExportRows(studentGroups),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [studentGroups, classItems]
  );

  // The endpoint caps `limit` at 100, so a school with more students than that
  // needs several passes before the register is complete.
  const fetchAllForExport = async () => {
    const EXPORT_PAGE_SIZE = 100;
    const collected: typeof studentGroups = [];
    let page = 1;
    let totalPages = 1;
    // Period / class / category / search / payers-only still scope the
    // register, but the transaction-status filter is dropped: it narrows each
    // student's `payments` array, and the fee columns count PAID entries only
    // — exporting under "Pending" would hand back a sheet of zeros.
    const exportFilters = {
      academicPeriod: filters.academicPeriod,
      classId: filters.classId,
      category: filters.category,
      onlyWithTransactions,
    };

    do {
      const result = await fetchAllStudentGroups({
        schoolId: String(authstate.currentUser?.schoolId),
        page,
        limit: EXPORT_PAGE_SIZE,
        search: searchQuery,
        ...exportFilters,
      }).unwrap();
      collected.push(...(result?.data?.items ?? []));
      totalPages = result?.data?.meta?.totalPages ?? 1;
      page += 1;
    } while (page <= totalPages);

    return toExportRows(collected);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPageIndex(0);
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
            {schoolMetric.map((category) => (
              <MetricCard
                key={category.category}
                title={category.label}
                studentCount={category.studentCount}
                collected={formatNaira(category.totalPaid)}
                outstanding={
                  category.category === "FULLY_PAID"
                    ? undefined
                    : formatNaira(category.totalOutstanding)
                }
                onClick={() => handleViewList(category.category)}
              />
            ))}
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
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyWithTransactions}
                onChange={(e) => {
                  setOnlyWithTransactions(e.target.checked);
                  setPageIndex(0);
                }}
                className="w-4 h-4 rounded border-gray-300 accent-purple-600 cursor-pointer"
              />
              Only students with payments
            </label>
          </div>
          <ExportButton
            data={exportData}
            getData={fetchAllForExport}
            disabled={totalCount === 0}
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
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          error={error}
          classItems={classItems?.data ?? []}
          selectedPaymentIds={selectedPaymentIds}
          setSelectedPaymentIds={setSelectedPaymentIds}
          totalCount={totalCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
          searchTerm={searchQuery}
          onPageChange={setPageIndex}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPageIndex(0);
          }}
          onSearch={handleSearch}
          onRefresh={refetch}
        />
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
