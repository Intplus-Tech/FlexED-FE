"use client";

import { useState } from "react";
import { TableSkeleton } from "../../loader/table-loader";
import { useGetAllClassesQuery } from "@/redux/api/class";

interface ClassData {
  id: string;
  className: string;
  level: string;
  classType: string;
  subClass: string;
  students: number;
  status: "Active" | "Inactive";
}

const classes: ClassData[] = [
  {
    id: "1",
    className: "JSS 1",
    level: "Junior Secondary 1",
    classType: "Native",
    subClass: "Science",
    students: 45,
    status: "Active",
  },
  {
    id: "2",
    className: "JSS 2",
    level: "Junior Secondary 2",
    classType: "Native",
    subClass: "Arts",
    students: 42,
    status: "Active",
  },
  {
    id: "3",
    className: "JSS 3",
    level: "Junior Secondary 3",
    classType: "Native",
    subClass: "Commercial",
    students: 48,
    status: "Active",
  },
  {
    id: "4",
    className: "SSS 1",
    level: "Senior Secondary 1",
    classType: "Native",
    subClass: "Science",
    students: 52,
    status: "Active",
  },
  {
    id: "5",
    className: "SSS 2",
    level: "Senior Secondary 2",
    classType: "Special",
    subClass: "Remedial",
    students: 47,
    status: "Inactive",
  },
  {
    id: "6",
    className: "SSS 3",
    level: "Senior Secondary 3",
    classType: "Special",
    subClass: "Extra Lesson",
    students: 46,
    status: "Active",
  },
];

const ClassTable = () => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    data: classes,
    isFetching: isClassesFetching,
    isLoading: isClassesLoading,
  } = useGetAllClassesQuery();

  if (isClassesFetching || isClassesLoading) {
    return <TableSkeleton />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-4 text-left">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-gray-300 cursor-pointer"
              />
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
              Class Name
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
              Level
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
              Class Type
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
              Sub Class
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
              Students
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {classes?.data?.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-4">
                No classes found
              </td>
            </tr>
          ) : (
            classes?.data?.map((cls) => (
              <tr
                key={cls._id}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-gray-300 cursor-pointer"
                  />
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {cls.name}
                </td>
                <td className="px-6 py-4 text-gray-600">{cls.level}</td>
                <td className="px-6 py-4 text-gray-600">{cls.classType}</td>
                <td className="px-6 py-4 text-gray-600">{cls.subClass}</td>
                <td className="px-6 py-4 text-gray-600">{cls.classType}</td>
                <td className="px-6 py-4 text-gray-600">
                  <div className="flex gap-4">
                    <button className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                      Edit
                    </button>
                    <button className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ClassTable;
