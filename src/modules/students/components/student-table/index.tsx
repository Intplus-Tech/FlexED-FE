 "use client";

import { useState } from "react";
import StudentTableLoader from "../../Loader/table-loader";
import { StudentProfileModal } from "../student-profile";
import { GetStudentsResponse, Student } from "@/@types/student";
import { ClassItem } from "@/@types/class";

interface StudentTableProps {
  students: GetStudentsResponse;
  isLoading?: boolean;
  classItems: ClassItem[];
}

export function StudentTable({
  students,
  isLoading = false,
  classItems,
}: StudentTableProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  console.log(students);

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return <StudentTableLoader />;
  }

  const getClassById = (classId: string) => {
    const classItem = classItems.find((item) => item._id === classId);
    return classItem ? classItem.name : "";
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 border-2 border-gray-300 rounded cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-600">
                    Student ID
                  </span>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 whitespace-nowrap">
                Student Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 whitespace-nowrap">
                Admission Number
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 whitespace-nowrap">
                Class
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 whitespace-nowrap">
                Gender
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 whitespace-nowrap">
                Amount Fee
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 whitespace-nowrap">
                Paid TD
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 whitespace-nowrap">
                Balance
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students?.data?.items?.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center">
                  No data available
                </td>
              </tr>
            ) : (
              students?.data?.items?.map((student) => {
                return (
                  <tr
                    key={student._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 border-2 border-gray-300 rounded cursor-pointer"
                        />
                        <span className="text-sm text-gray-900">
                          {student._id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {`${student.firstName} ${student.lastName}`}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {student.admissionNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {getClassById(student.class)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {student.gender}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {"-"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {"-"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {"-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleViewStudent(student)}
                          className="text-sm text-gray-700 hover:text-gray-900 underline"
                        >
                          View
                        </button>
                        <span className="text-gray-300">|</span>
                        {/* <button className="text-sm text-gray-700 hover:text-gray-900 underline">
                        Edit
                      </button> */}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <StudentProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        student={selectedStudent}
        classItems={classItems ?? []}
      />
    </div>
  );
}
