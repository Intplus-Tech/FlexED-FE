"use client";

import { useState, useMemo } from "react";
import { StudentMetricCard } from "../components/metric-card";
import { StudentTable } from "../components/student-table";
import { Pagination } from "@/components/pagination";
import { SearchInput } from "@/components/search-input";
import { ChevronDownIcon, ExportIcon, FilterIcon } from "@/icon/dashbaord";
import { AddStudentModal } from "../components/add-student";
import { useGetAllStudentQuery } from "@/redux/api/student";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useGetSchoolMetricsQuery } from "@/redux/api/school";

export default function StudentView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const itemsPerPage = 10;

  const { currentUser } = useSelector((state: RootState) => state.authState);
  const {
    data: students,
    isFetching: isFetchingStudents,
    isLoading: isLoadingStudents,
  } = useGetAllStudentQuery({
    schoolId: currentUser?.schoolId as string,
  });

  const {
    data: schoolMetrics,
    isFetching: isFetchingMetrics,
    isLoading: isLoadingMetrics,
  } = useGetSchoolMetricsQuery(
    {
      schoolId: String(currentUser?.schoolId),
    },
    { skip: !currentUser }
  );
  console.log(schoolMetrics, "students");

  const colors = ["green", "red", "gray"] as const;
  const formattedSchoolMetrics = useMemo(() => {
    return schoolMetrics?.data?.categories?.map((category, index) => ({
      ...category,
      color: colors[index],
    }));
  }, [schoolMetrics]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className=" space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Students</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {formattedSchoolMetrics?.map((metric, index) => (
          <StudentMetricCard
            key={index}
            title={metric.label}
            value={String(metric.studentCount)}
            valueColor={metric.color}
          />
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <button
          onClick={() => setIsAddStudentOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          Add Student
        </button>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full md:w-auto">
          <SearchInput onSearch={handleSearch} placeholder="Search" />

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
              <FilterIcon />
              Filter
            </button>

            <button className="flex items-center gap-2 px-4 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors">
              <ExportIcon />
              Export
              <ChevronDownIcon />
            </button>
          </div>
        </div>
      </div>

      <StudentTable
        students={students?.data ?? []}
        isLoading={isFetchingStudents || isLoadingStudents}
      />

      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
      />

      {/* {!isLoadingStudents && filteredStudents.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {!isLoadingStudents &&  (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No students found matching your search.
          </p>
        </div>
      )} */}
    </div>
  );
}
