"use client";

import { useState, useEffect } from "react";
import { SearchIcon, FilterIcon, ExportIcon } from "@/icon/dashbaord/class";
import type { ClassFormData } from "@/lib/validations";
import { AddClassModal } from "../components/add-class";
import ClassTable from "../components/class-table";

const ITEMS_PER_PAGE = 6;

export function ClassManagementView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const handleAddClass = async (data: ClassFormData) => {
    // Simulate API call
    console.log("Adding class:", data);
    // You would typically make an API call here
  };

  const handleEdit = (id: string) => {
    console.log("Edit class:", id);
    // Handle edit action
  };

  const handleDelete = (id: string) => {
    console.log("Delete class:", id);
    // Handle delete action
  };

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
            <button className="px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium">
              <ExportIcon />
              Export
            </button>
          </div>
        </div>
      </div>

      <ClassTable />

      <AddClassModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleAddClass}
      />
    </div>
  );
}
