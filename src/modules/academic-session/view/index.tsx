"use client";

import { useState, useMemo } from "react";
import AcademicTable from "../components/academic-session-table";
import AddPeriodModal from "../components/add-academic-session";
import {
  CreateAcademicSessionRequest,
  SessionData,
} from "@/@types/academic-session";
import {
  useCreateAcademicSessionMutation,
  useGetAllAcademicSessionQuery,
} from "@/redux/api/academicSession";
import { showerror, showsuccess } from "@/utils/toast";
import { ExportButton } from "@/components/export-button";
import { Pagination } from "@/components/pagination";
import { SearchInput } from "@/components/search-input";

const ITEMS_PER_PAGE = 10;

export default function AcademicSessionView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<SessionData | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: academicPeriods,
    isLoading: isLoadingAcademicPeriod,
    isFetching: isFetchingAcademicPeriod,
  } = useGetAllAcademicSessionQuery({
    search: searchTerm,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });

  const exportData = useMemo(() => {
    return (
      academicPeriods?.data?.items?.map((period: any) => ({
        "Period Name": period.name,
        "Start Date": new Date(period.startDate).toLocaleDateString(),
        "End Date": new Date(period.endDate).toLocaleDateString(),
        Status: period.isActive ? "Active" : "Completed",
      })) || []
    );
  }, [academicPeriods]);

  const handleEdit = (period: SessionData) => {
    setSelectedPeriod(period);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPeriod(null);
  };

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    setCurrentPage(1);
  };

  const totalPages = academicPeriods?.data?.meta?.totalPages || 1;

  return (
    <main className="min-h-screen ">
      <div className="">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Academic Period
          </h1>
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">
              Current Academic Year
            </h2>
            <p className="text-muted-foreground">2024/2025 Session</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
          <div className="flex gap-4 flex-1 w-full sm:w-auto">
            <SearchInput onSearch={handleSearch} placeholder="Search" />

            {/* Filter */}
            {/* <button className="px-4 py-2 bg-card text-foreground border border-input rounded-md hover:bg-muted flex items-center gap-2 whitespace-nowrap">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filter
            </button> */}
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            {/* Export */}
            <ExportButton
              data={exportData}
              filename="Academic_Periods"
              sheetName="Periods"
            />

            {/* Add Button */}
            <button
              onClick={() => {
                setSelectedPeriod(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-black text-white  rounded-md  font-medium whitespace-nowrap"
            >
              + Add Academic Period
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <AcademicTable
              periods={
                academicPeriods ?? {
                  success: true,
                  message: "",
                  statusCode: 200,
                  data: {
                    items: [] as SessionData[],
                    meta: {
                      page: 1,
                      limit: 10,
                      total: 0,
                      totalPages: 0,
                      hasNextPage: false,
                      hasPrevPage: false,
                    },
                  },
                }
              }
              isLoading={isLoadingAcademicPeriod || isFetchingAcademicPeriod}
              onEdit={handleEdit}
            />
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>

      {/* Add Period Modal */}
      <AddPeriodModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={selectedPeriod}
      />
    </main>
  );
}
