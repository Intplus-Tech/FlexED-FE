"use client";

import { useState } from "react";
import { AddClassModal } from "../components/add-class";
import ClassTable from "../components/class-table";
import { SearchIcon, FilterIcon } from "@/icon/dashbaord/class";

import { useMemo } from "react";
import { ExportButton } from "@/components/export-button";
import { useGetAllClassesQuery } from "@/redux/api/class";

export function ClassManagementView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: classes } = useGetAllClassesQuery();

  const exportData = useMemo(() => {
    return (
      classes?.data?.map((cls: any) => ({
        "Class Name": cls.name,
        Level: cls.level,
        "Class Type": cls.classType,
        "Sub Class": cls.subClass,
      })) || []
    );
  }, [classes]);

  return (
    <div className="min-h-screen bg-white">
      <div className="">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Class Management
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-between">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Add Class
          </button>

          <div className="flex-1 max-w-md relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-200 border-0 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
            />
          </div>

          <div className="flex gap-3">
            <button className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 text-gray-700 font-medium">
              <FilterIcon />
              Filter
            </button>
            <ExportButton
              data={exportData}
              filename="Classes_List"
              sheetName="Classes"
            />
          </div>
        </div>
      </div>

      <ClassTable />

      <AddClassModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
