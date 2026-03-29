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
import { useGetAllClassesQuery } from "@/redux/api/class";
import { Dialog } from "@/components/ui/dialog";
import AddBulkStudentModal from "../components/add-bulk-student";
import { ExportButton } from "@/components/export-button";
import { usePermission } from "@/utils/permissions";

export default function StudentView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const itemsPerPage = 10;

  const { currentUser } = useSelector((state: RootState) => state.authState);
  const {
    data: students,
    isFetching: isFetchingStudents,
    isLoading: isLoadingStudents,
  } = useGetAllStudentQuery({
    page: currentPage,
    limit: itemsPerPage,
    schoolId: currentUser?.schoolId as string,
    search: searchQuery,
  });

  const {
    data: classes,
    isFetching: isFetchingClasses,
    isLoading: isLoadingClasses,
  } = useGetAllClassesQuery();

  const { isStaff } = usePermission();

  const {
    data: schoolMetrics,
    isFetching: isFetchingMetrics,
    isLoading: isLoadingMetrics,
  } = useGetSchoolMetricsQuery(
    {
      schoolId: String(currentUser?.schoolId),
    },
    { skip: !currentUser || isStaff },
  );

  const colors = ["green", "red", "gray"] as const;
  const formattedSchoolMetrics = useMemo(() => {
    return schoolMetrics?.data?.categories?.map((category, index) => ({
      ...category,
      color: colors[index],
    }));
  }, [schoolMetrics]);

  const exportData = useMemo(() => {
    return (
      students?.data?.items?.map((student) => ({
        "Student ID": student._id,
        "First Name": student.firstName,
        "Last Name": student.lastName,
        "Admission Number": student.admissionNumber,
        Class:
          classes?.data?.find((c) => c._id === student.class)?.name ||
          student.class,
        Gender: student.gender,
        "Date of Birth": student.dateOfBirth,
      })) || []
    );
  }, [students, classes]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = students?.data?.meta?.totalPages || 1;

  return (
    <div className=" space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Students</h1>
      {!isStaff && (
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
      )}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative">
          <button
            onClick={() => setIsModalOpen(!isModalOpen)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Add Student
          </button>

          {isModalOpen && (
            <div className=" absolute top-12 flex flex-col  bg-white shadow-lg rounded-lg leading-none z-50">
              <button
                onClick={() => setIsAddStudentOpen(true)}
                className="text-sm whitespace-nowrap py-4 hover:bg-gray-100 px-4 rounded-t-lg text-left"
              >
                Add Single student
              </button>
              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="text-sm whitespace-nowrap py-4 hover:bg-gray-100 px-4 rounded-b-lg text-left"
              >
                Add Bulk student
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full md:w-auto">
          <SearchInput onSearch={handleSearch} placeholder="Search" />

          <div className="flex gap-3">
            {/* <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
              <FilterIcon />
              Filter
            </button> */}

            <ExportButton
              data={exportData}
              filename="Students_List"
              sheetName="Students"
            />
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <StudentTable
          students={
            students ?? {
              success: true,
              message: "",
              statusCode: 200,
              data: {
                items: [],
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
          isLoading={isFetchingStudents || isLoadingStudents}
          classItems={classes?.data ?? []}
        />

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      <AddStudentModal
        classItems={classes?.data ?? []}
        isClassesLoading={isFetchingClasses || isLoadingClasses}
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        onCloseModal={() => setIsModalOpen(false)}
      />
      <AddBulkStudentModal
        isbulkModalOpen={isBulkModalOpen}
        setIsBulkModalOpen={setIsBulkModalOpen}
        classItems={classes?.data ?? []}
        isClassLoading={isFetchingClasses || isLoadingClasses}
      />
    </div>
  );
}
