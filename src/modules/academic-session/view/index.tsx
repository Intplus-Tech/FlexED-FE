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

export default function AcademicSessionView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<SessionData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const {
    data: academicPeriods,
    isLoading: isLoadingAcademicPeriod,
    isFetching: isFetchingAcademicPeriod,
  } = useGetAllAcademicSessionQuery();

  console.log("academic periods", academicPeriods);

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
            <div className="flex-1 sm:flex-none relative">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-muted text-foreground placeholder:text-muted-foreground rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Filter */}
            <button className="px-4 py-2 bg-card text-foreground border border-input rounded-md hover:bg-muted flex items-center gap-2 whitespace-nowrap">
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
            </button>
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
