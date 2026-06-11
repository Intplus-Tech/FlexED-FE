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
import { DeleteModal } from "@/components/delete-modal";
import { BulkAssignClassModal } from "../components/bulk-assign-modal";
import { BulkDiscountModal } from "../components/bulk-discount-modal";
import { BulkExemptionModal } from "../components/bulk-exemption-modal";
import { EditStudentModal } from "../components/edit-student";
import { useBulkDeleteStudentsMutation } from "@/redux/api/student";
import { showerror, showsuccess } from "@/utils/toast";

export default function StudentView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isExemptionModalOpen, setIsExemptionModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [bulkDeleteStudents, { isLoading: isBulkDeleting }] = useBulkDeleteStudentsMutation();
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
    classId: selectedClassId,
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
    setSelectedStudentIds([]);
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClassId(e.target.value);
    setCurrentPage(1);
    setSelectedStudentIds([]);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedStudentIds([]);
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      const res = await bulkDeleteStudents({ studentIds: selectedStudentIds }).unwrap();
      showsuccess(res?.message || "Students deleted successfully");
      setSelectedStudentIds([]);
      setIsDeleteConfirmOpen(false);
    } catch (error: any) {
      showerror(
        error?.data?.message || "Failed to delete selected students"
      );
    }
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
            disabled={selectedStudentIds.length > 0}
            onClick={() => !isModalOpen && setIsModalOpen(!isModalOpen)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <SearchInput
              disabled={selectedStudentIds.length > 0}
              onSearch={handleSearch}
              placeholder="Search students..."
            />
            
            <div className="relative">
              <select
                disabled={selectedStudentIds.length > 0}
                value={selectedClassId}
                onChange={handleClassChange}
                className="w-full md:w-auto pl-4 pr-10 py-3 bg-gray-100 text-gray-900 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all appearance-none min-w-[160px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">All Classes</option>
                {classes?.data?.map((classItem) => (
                  <option key={classItem._id} value={classItem._id}>
                    {classItem.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <ChevronDownIcon />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {/* <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
              <FilterIcon />
              Filter
            </button> */}

            <ExportButton
              disabled={selectedStudentIds.length > 0}
              data={exportData}
              filename="Students_List"
              sheetName="Students"
            />
          </div>
        </div>
      </div>

      {selectedStudentIds.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-purple-50 border border-purple-100 rounded-xl p-4 sm:px-6 animate-in fade-in slide-in-from-top-4 duration-300 gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-purple-900 bg-purple-100 px-3 py-1 rounded-full">
              {selectedStudentIds.length} Selected
            </span>
            <span className="text-sm text-purple-700 font-medium">
              student{selectedStudentIds.length > 1 ? "s" : ""} chosen for bulk actions
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all active:scale-95"
            >
              Assign Class
            </button>
            <button
              onClick={() => setIsDiscountModalOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all active:scale-95"
            >
              Give Discount
            </button>
            <button
              onClick={() => setIsExemptionModalOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all active:scale-95"
            >
              Exempt
            </button>
            <button
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all active:scale-95"
            >
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedStudentIds([])}
              className="w-full sm:w-auto px-4 py-2.5 text-gray-500 hover:text-gray-700 text-sm font-semibold transition-colors text-center cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
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
          selectedStudentIds={selectedStudentIds}
          setSelectedStudentIds={setSelectedStudentIds}
          onEditStudent={(id) => {
            setEditingStudentId(id);
            setIsEditModalOpen(true);
          }}
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

      <DeleteModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
        title="Delete Selected Students"
        description={`Are you sure you want to delete ${selectedStudentIds.length} selected student(s)? This action cannot be undone.`}
        isLoading={isBulkDeleting}
      />

      <BulkAssignClassModal
        open={isAssignModalOpen}
        onOpenChange={setIsAssignModalOpen}
        studentIds={selectedStudentIds}
        classItems={classes?.data ?? []}
        onSuccess={() => setSelectedStudentIds([])}
      />

      <BulkDiscountModal
        open={isDiscountModalOpen}
        onOpenChange={setIsDiscountModalOpen}
        studentIds={selectedStudentIds}
        onSuccess={() => setSelectedStudentIds([])}
      />

      <BulkExemptionModal
        open={isExemptionModalOpen}
        onOpenChange={setIsExemptionModalOpen}
        studentIds={selectedStudentIds}
        onSuccess={() => setSelectedStudentIds([])}
      />

      <EditStudentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingStudentId(null);
        }}
        studentId={editingStudentId}
        classItems={classes?.data ?? []}
        isClassesLoading={isFetchingClasses || isLoadingClasses}
      />
    </div>
  );
}
