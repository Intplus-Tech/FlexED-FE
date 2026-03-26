"use client";

import { useState } from "react";
import { TableSkeleton } from "../../loader/table-loader";
import {
  useDeleteClassMutation,
  useGetAllClassesQuery,
} from "@/redux/api/class";
import { DeleteModal } from "@/components/delete-modal";
import { showerror, showsuccess } from "@/utils/toast";
import { ClassItem } from "@/@types/class";

import { AddClassModal } from "../add-class";

const ClassTable = () => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const {
    data: classes,
    isFetching: isClassesFetching,
    isLoading: isClassesLoading,
  } = useGetAllClassesQuery();

  const [deleteClass, { isLoading: isDeleteLoading }] =
    useDeleteClassMutation();

  const handleDeleteConfirm = async () => {
    if (!selectedClass) {
      console.error("No class selected for deletion");
      return;
    }
    try {
      const res = await deleteClass(selectedClass?._id).unwrap();
      showsuccess(res.message);
      console.log("Class deleted successfully");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      showerror(error.data.message);
      console.error("Error deleting class:", error);
    }
  };

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
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 whitespace-nowrap">
              Class Name
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 whitespace-nowrap">
              Level
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 whitespace-nowrap">
              Class Type
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 whitespace-nowrap">
              Sub Class
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 whitespace-nowrap">
              Students
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 whitespace-nowrap">
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
                <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                  {cls.level}
                </td>
                <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                  {cls.classType}
                </td>
                <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                  {cls.subClass}
                </td>
                <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                  {""}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setSelectedClass(cls);
                        setIsEditOpen(true);
                      }}
                      className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setIsDeleteOpen(true);
                        setSelectedClass(cls);
                      }}
                      className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <AddClassModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        initialData={selectedClass}
      />

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleteLoading}
        title="Delete Account"
        description="Are you sure you want to delete this class"
        itemName={selectedClass?.name}
      />
    </div>
  );
};

export default ClassTable;
