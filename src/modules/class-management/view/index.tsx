"use client";

import { useMemo, useState } from "react";

import { ExportButton } from "@/components/export-button";
import { useGetAllClassesQuery } from "@/redux/api/class";

import { AddClassModal } from "../components/add-class";
import ClassTable from "../components/class-table";

export function ClassManagementView() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: classes } = useGetAllClassesQuery();

  const exportData = useMemo(
    () =>
      classes?.data?.map((cls) => ({
        "Class Name": cls.name,
        Level: cls.level,
        "Class Type": cls.classType,
        "Sub Class": cls.subClass,
        Description: cls.description,
      })) || [],
    [classes]
  );

  return (
    <div className="min-h-screen space-y-6 bg-white">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold text-gray-900">Class Management</h1>
        <div className="flex items-center gap-3">
          <ExportButton
            data={exportData}
            filename="Classes_List"
            sheetName="Classes"
            disabled={exportData.length === 0}
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="cursor-pointer rounded-lg bg-gray-900 px-6 py-2.5 font-medium text-white transition-colors hover:bg-gray-800"
          >
            Add Class
          </button>
        </div>
      </div>

      <ClassTable />

      <AddClassModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
