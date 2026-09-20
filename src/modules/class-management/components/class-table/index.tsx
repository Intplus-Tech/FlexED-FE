"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

import { ClassItem } from "@/@types/class";
import { DeleteModal } from "@/components/delete-modal";
import { DataTable } from "@/components/ui/data-table";
import { TableEmptyState } from "@/components/ui/table-empty-state";
import { ACTIONS_COLUMN_ID } from "@/lib/table-column-prefs";
import {
  useDeleteClassMutation,
  useGetAllClassesQuery,
} from "@/redux/api/class";
import { showerror, showsuccess } from "@/utils/toast";

import { AddClassModal } from "../add-class";

const MANIFEST = [
  { key: "name", label: "Class Name" },
  { key: "level", label: "Level" },
  { key: "classType", label: "Class Type" },
  { key: "subClass", label: "Sub Class" },
  { key: "description", label: "Description" },
];

const ClassTable = ({ action }: { action?: React.ReactNode }) => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [search, setSearch] = useState("");

  const {
    data: classes,
    isFetching,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAllClassesQuery();

  const [deleteClass, { isLoading: isDeleteLoading }] = useDeleteClassMutation();

  const handleDeleteConfirm = async () => {
    if (!selectedClass) return;
    try {
      const res = await deleteClass(selectedClass._id).unwrap();
      showsuccess(res.message);
      setIsDeleteOpen(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      showerror(error?.data?.message || "Failed to delete class");
    }
  };

  // The list endpoint returns every class at once, so search filters here
  // rather than round-tripping — and unlike the old page-level search box, this
  // one is actually wired to the rows.
  const rows = useMemo(() => {
    const all = classes?.data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return all;
    return all.filter((cls) =>
      [cls.name, cls.level, cls.classType, cls.subClass]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q))
    );
  }, [classes?.data, search]);

  const columns = useMemo<ColumnDef<ClassItem, unknown>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: "Class Name",
        cell: ({ row }) => (
          <span className="font-medium text-gray-900">{row.original.name}</span>
        ),
      },
      { id: "level", accessorKey: "level", header: "Level" },
      { id: "classType", accessorKey: "classType", header: "Class Type" },
      { id: "subClass", accessorKey: "subClass", header: "Sub Class" },
      {
        id: "description",
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <span className="text-gray-500">{row.original.description || "—"}</span>
        ),
      },
      {
        id: ACTIONS_COLUMN_ID,
        header: "",
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => {
                setSelectedClass(row.original);
                setIsEditOpen(true);
              }}
              title="Edit class"
              className="cursor-pointer rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => {
                setSelectedClass(row.original);
                setIsDeleteOpen(true);
              }}
              title="Delete class"
              className="cursor-pointer rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <>
      <DataTable
        title="Classes"
        action={action}
        columns={columns}
        data={rows}
        isLoading={isLoading}
        isRefetching={isFetching && !isLoading}
        isError={isError}
        error={error}
        onRefresh={refetch}
        onSearch={setSearch}
        searchPlaceholder="Search classes..."
        pageSize={10}
        empty={
          <TableEmptyState
            title={search ? "No classes match your search" : "No classes yet"}
            description={
              search
                ? "Try a different name, level or class type."
                : "Add your first class to start organising students."
            }
          />
        }
        fullView={{
          columns,
          manifest: MANIFEST,
          title: "Classes",
          tableId: "classes",
        }}
      />

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
        title="Delete Class"
        description="Are you sure you want to delete this class"
        itemName={selectedClass?.name}
      />
    </>
  );
};

export default ClassTable;
