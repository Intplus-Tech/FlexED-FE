"use client";

import { useState, useMemo } from "react";
import { StudentMetricCard } from "../components/metric-card";
import { StudentTable } from "../components/student-table";
import { Pagination } from "@/components/pagination";
import { SearchInput } from "@/components/search-input";
import { ChevronDownIcon, ExportIcon, FilterIcon } from "@/icon/dashbaord";
import { AddStudentModal } from "../components/add-student";

export default function StudentView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isLoading] = useState(false);
  const itemsPerPage = 10;

  const allStudents = [
    {
      id: "1",
      studentId: "8723",
      studentName: "Chiamaka Adebayo",
      class: "SSS 3",
      amountFee: "₦350,000",
      paidTD: "₦150,000",
      balance: "₦200,000",
    },
    {
      id: "2",
      studentId: "8723",
      studentName: "Aisha Mohammed",
      class: "JSS 1",
      amountFee: "₦350,000",
      paidTD: "₦150,000",
      balance: "₦200,000",
    },
    {
      id: "3",
      studentId: "8723",
      studentName: "Emeka Okoro",
      class: "SSS 3",
      amountFee: "₦350,000",
      paidTD: "₦150,000",
      balance: "₦200,000",
    },
    {
      id: "4",
      studentId: "8724",
      studentName: "Fatima Bello",
      class: "JSS 2",
      amountFee: "₦350,000",
      paidTD: "₦150,000",
      balance: "₦200,000",
    },
    {
      id: "5",
      studentId: "8725",
      studentName: "Chinedu Okafor",
      class: "SSS 1",
      amountFee: "₦350,000",
      paidTD: "₦150,000",
      balance: "₦200,000",
    },
    {
      id: "6",
      studentId: "8726",
      studentName: "Zainab Ibrahim",
      class: "JSS 3",
      amountFee: "₦350,000",
      paidTD: "₦150,000",
      balance: "₦200,000",
    },
    {
      id: "7",
      studentId: "8727",
      studentName: "Oluwaseun Adeyemi",
      class: "SSS 2",
      amountFee: "₦350,000",
      paidTD: "₦150,000",
      balance: "₦200,000",
    },
    {
      id: "8",
      studentId: "8728",
      studentName: "Blessing Nwankwo",
      class: "JSS 1",
      amountFee: "₦350,000",
      paidTD: "₦150,000",
      balance: "₦200,000",
    },
    {
      id: "9",
      studentId: "8729",
      studentName: "Yusuf Musa",
      class: "SSS 3",
      amountFee: "₦350,000",
      paidTD: "₦150,000",
      balance: "₦200,000",
    },
    {
      id: "10",
      studentId: "8730",
      studentName: "Ngozi Eze",
      class: "JSS 2",
      amountFee: "₦350,000",
      paidTD: "₦150,000",
      balance: "₦200,000",
    },
  ];

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return allStudents;

    const query = searchQuery.toLowerCase();
    return allStudents.filter(
      (student) =>
        student.studentName.toLowerCase().includes(query) ||
        student.studentId.toLowerCase().includes(query) ||
        student.class.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

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
        <StudentMetricCard
          title="Total Students"
          value="2295"
          change="+ 15.6%"
          changeLabel="From Previous Term"
          valueColor="green"
          viewListHref="/dashboard/students/all"
        />
        <StudentMetricCard
          title="Total Paid"
          value="2145"
          change="+ 15.6%"
          changeLabel="From Previous Term"
          valueColor="red"
          viewListHref="/dashboard/students/paid"
        />
        <StudentMetricCard
          title="Total Outstanding"
          value="150"
          change="+ 15.6%"
          changeLabel="From Previous Term"
          valueColor="gray"
          viewListHref="/dashboard/students/outstanding"
        />
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

      <StudentTable students={currentStudents} isLoading={isLoading} />

      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
      />

      {!isLoading && filteredStudents.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {!isLoading && filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No students found matching your search.
          </p>
        </div>
      )}
    </div>
  );
}
