"use client";

import { useMemo, useState } from "react";

import { SessionData } from "@/@types/academic-session";
import { ExportButton } from "@/components/export-button";
import { useGetAllAcademicSessionQuery } from "@/redux/api/academicSession";

import AcademicTable from "../components/academic-session-table";
import AddPeriodModal from "../components/add-academic-session";

export default function AcademicSessionView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<SessionData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: academicPeriods,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetAllAcademicSessionQuery({
    search: searchTerm,
    page: pageIndex + 1,
    limit: pageSize,
  });

  const periods = academicPeriods?.data?.items ?? [];
  const totalCount = academicPeriods?.data?.meta?.total ?? 0;

  const exportData = useMemo(
    () =>
      periods.map((period) => ({
        "Period Name": period.name,
        "Start Date": new Date(period.startDate).toLocaleDateString(),
        "End Date": new Date(period.endDate).toLocaleDateString(),
        Status: period.isActive ? "Active" : "Completed",
      })),
    [periods]
  );

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPeriod(null);
  };

  return (
    <main className="min-h-screen space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Academic Period</h1>
          <p className="mt-1 text-gray-500">
            Manage the sessions and terms fees are billed against.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton
            data={exportData}
            filename="Academic_Periods"
            sheetName="Periods"
            disabled={exportData.length === 0}
          />
          <button
            onClick={() => {
              setSelectedPeriod(null);
              setIsModalOpen(true);
            }}
            className="cursor-pointer rounded-md bg-black px-4 py-2 font-medium whitespace-nowrap text-white transition-colors hover:bg-gray-800"
          >
            + Add Academic Period
          </button>
        </div>
      </div>

      <AcademicTable
        periods={periods}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        error={error}
        totalCount={totalCount}
        pageIndex={pageIndex}
        pageSize={pageSize}
        searchTerm={searchTerm}
        onPageChange={setPageIndex}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPageIndex(0);
        }}
        onSearch={(term) => {
          setSearchTerm(term);
          setPageIndex(0);
        }}
        onRefresh={refetch}
        onEdit={(period) => {
          setSelectedPeriod(period);
          setIsModalOpen(true);
        }}
      />

      <AddPeriodModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={selectedPeriod}
      />
    </main>
  );
}
