"use client";

import React, { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Download,
  Eye,
  FileText,
  GraduationCap,
  Mail,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";

import { Student } from "@/@types/student";
import { ClassItem } from "@/@types/class";
import { DeleteModal } from "@/components/delete-modal";
import { DataTable } from "@/components/ui/data-table";
import { TableEmptyState } from "@/components/ui/table-empty-state";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ACTIONS_COLUMN_ID, SELECT_COLUMN_ID } from "@/lib/table-column-prefs";
import { useDeleteStudentMutation } from "@/redux/api/student";
import { showerror, showsuccess } from "@/utils/toast";

import { PromoteStudentModal } from "../promote-student-modal";
import { ResendInviteModal } from "../resend-invite-modal";
import { StudentInvoiceButton } from "../student-invoice";
import { StudentProfileModal } from "../student-profile";
import { StudentReceiptButton } from "../student-receipt";

const MANIFEST = [
  { key: "name", label: "Student Name" },
  { key: "admissionNumber", label: "Admission Number" },
  { key: "class", label: "Class" },
  { key: "gender", label: "Gender" },
  { key: "dateOfBirth", label: "Date of Birth" },
];

interface StudentTableProps {
  students: Student[];
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  error?: unknown;
  classItems: ClassItem[];
  selectedStudentIds: string[];
  setSelectedStudentIds: React.Dispatch<React.SetStateAction<string[]>>;
  onEditStudent: (id: string) => void;
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  searchTerm?: string;
  filterControl?: React.ReactNode;
  action?: React.ReactNode;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSearch: (term: string) => void;
  onRefresh: () => void;
}

export function StudentTable({
  students,
  isLoading = false,
  isFetching = false,
  isError = false,
  error,
  classItems,
  selectedStudentIds,
  setSelectedStudentIds,
  onEditStudent,
  totalCount,
  pageIndex,
  pageSize,
  searchTerm,
  filterControl,
  action,
  onPageChange,
  onPageSizeChange,
  onSearch,
  onRefresh,
}: StudentTableProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [studentToPromote, setStudentToPromote] = useState<Student | null>(null);
  const [receiptRequest, setReceiptRequest] = useState<{
    studentId: string;
    nonce: number;
  } | null>(null);
  const [invoiceRequest, setInvoiceRequest] = useState<{
    studentId: string;
    nonce: number;
  } | null>(null);
  const [studentForInvite, setStudentForInvite] = useState<Student | null>(null);

  const [deleteStudent, { isLoading: isDeleteLoading }] =
    useDeleteStudentMutation();

  // Soft-deleted students keep their records server-side but must not appear
  // in the roster.
  const rows = useMemo(
    () => students.filter((student) => !student.isDeleted),
    [students]
  );

  const allSelected =
    rows.length > 0 && rows.every((s) => selectedStudentIds.includes(s._id));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getClassById = (classId: string | any) => {
    if (!classId) return "";
    if (typeof classId === "object" && classId.name) return classId.name;
    const idToSearch = typeof classId === "object" ? classId._id : classId;
    const classItem = classItems.find((item) => item._id === idToSearch);
    return classItem
      ? classItem.name
      : typeof classId === "string"
        ? classId
        : "";
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    try {
      const res = await deleteStudent(studentToDelete._id).unwrap();
      showsuccess(res.message || "Student deleted successfully");
      setIsDeleteModalOpen(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      showerror(error?.data?.message || "Failed to delete student");
    }
  };

  const columns = useMemo<ColumnDef<Student, unknown>[]>(
    () => [
      {
        id: SELECT_COLUMN_ID,
        enableHiding: false,
        header: () => (
          <input
            type="checkbox"
            checked={allSelected}
            disabled={rows.length === 0}
            onChange={(e) =>
              setSelectedStudentIds(
                e.target.checked ? rows.map((student) => student._id) : []
              )
            }
            aria-label="Select all students"
            className="size-4 cursor-pointer rounded border-2 border-gray-300 accent-purple-500 disabled:cursor-not-allowed"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedStudentIds.includes(row.original._id)}
            onChange={(e) =>
              setSelectedStudentIds((prev) =>
                e.target.checked
                  ? [...prev, row.original._id]
                  : prev.filter((id) => id !== row.original._id)
              )
            }
            aria-label={`Select ${row.original.firstName} ${row.original.lastName}`}
            className="size-4 cursor-pointer rounded border-2 border-gray-300 accent-purple-500"
          />
        ),
      },
      {
        id: "name",
        header: "Student Name",
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        cell: ({ row }) => (
          <span className="font-medium text-gray-900">
            {row.original.firstName} {row.original.lastName}
          </span>
        ),
      },
      {
        id: "admissionNumber",
        accessorKey: "admissionNumber",
        header: "Admission Number",
      },
      {
        id: "class",
        accessorKey: "class",
        header: "Class",
        cell: ({ row }) => getClassById(row.original.class),
      },
      { id: "gender", accessorKey: "gender", header: "Gender" },
      {
        id: "dateOfBirth",
        accessorKey: "dateOfBirth",
        header: "Date of Birth",
        cell: ({ row }) =>
          row.original.dateOfBirth
            ? new Date(row.original.dateOfBirth).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "—",
      },
      {
        id: ACTIONS_COLUMN_ID,
        header: "",
        enableHiding: false,
        cell: ({ row }) => {
          const student = row.original;
          return (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  disabled={selectedStudentIds.length > 0}
                  title="More actions"
                  aria-label="Student actions"
                  className="cursor-pointer rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <MoreVertical size={18} />
                </button>
              </PopoverTrigger>
              {/* Replaces a hand-positioned portal menu that had to close itself
                  on every scroll event to stay glued to its row. */}
              <PopoverContent align="end" className="w-52 py-1.5">
                <MenuItem
                  icon={<Eye size={15} />}
                  label="View Student"
                  onClick={() => {
                    setSelectedStudent(student);
                    setIsModalOpen(true);
                  }}
                />
                <MenuItem
                  icon={<Pencil size={15} />}
                  label="Edit Student"
                  onClick={() => onEditStudent(student._id)}
                />
                <MenuItem
                  icon={<Download size={15} />}
                  label="Download Receipt"
                  onClick={() =>
                    setReceiptRequest({
                      studentId: student._id,
                      nonce: Date.now(),
                    })
                  }
                />
                <MenuItem
                  icon={<FileText size={15} />}
                  label="Download Invoice"
                  onClick={() =>
                    setInvoiceRequest({
                      studentId: student._id,
                      nonce: Date.now(),
                    })
                  }
                />
                <MenuItem
                  icon={<Mail size={15} />}
                  label="Resend Invite"
                  onClick={() => setStudentForInvite(student)}
                />
                <MenuItem
                  icon={<GraduationCap size={15} />}
                  label="Promote Student"
                  onClick={() => {
                    setStudentToPromote(student);
                    setIsPromoteModalOpen(true);
                  }}
                />
                <div className="my-1 border-t border-gray-100" />
                <MenuItem
                  icon={<Trash2 size={15} />}
                  label="Delete Student"
                  destructive
                  onClick={() => {
                    setStudentToDelete(student);
                    setIsDeleteModalOpen(true);
                  }}
                />
              </PopoverContent>
            </Popover>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allSelected, rows, selectedStudentIds, classItems, onEditStudent]
  );

  return (
    <>
      <DataTable
        title="Students"
        action={action}
        columns={columns}
        data={rows}
        isLoading={isLoading}
        isRefetching={isFetching && !isLoading}
        isError={isError}
        error={error}
        onRefresh={onRefresh}
        onSearch={onSearch}
        searchPlaceholder="Search students..."
        filterControl={filterControl}
        serverPagination={{
          totalCount,
          pageIndex,
          pageSize,
          onPageChange,
          onPageSizeChange,
        }}
        empty={
          <TableEmptyState
            title={
              searchTerm ? "No students match your search" : "No students yet"
            }
            description={
              searchTerm
                ? "Try a different name or admission number, or clear the class filter."
                : "Add your first student, or bulk-upload your roster to get started."
            }
          />
        }
        fullView={{
          columns,
          manifest: MANIFEST,
          title: "Students",
          tableId: "students",
        }}
      />

      <StudentProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        student={selectedStudent}
        classItems={classItems ?? []}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleteLoading}
        title="Delete Student"
        description="Are you sure you want to delete "
        itemName={`${studentToDelete?.firstName} ${studentToDelete?.lastName}?`}
      />
      <PromoteStudentModal
        open={isPromoteModalOpen}
        onOpenChange={(open) => {
          setIsPromoteModalOpen(open);
          if (!open) setStudentToPromote(null);
        }}
        classItems={classItems}
        student={studentToPromote}
      />
      <ResendInviteModal
        isOpen={studentForInvite !== null}
        onClose={() => setStudentForInvite(null)}
        student={studentForInvite}
      />

      {receiptRequest && (
        <StudentReceiptButton
          studentId={receiptRequest.studentId}
          variant="hidden"
          trigger={receiptRequest.nonce}
        />
      )}
      {invoiceRequest && (
        <StudentInvoiceButton
          studentId={invoiceRequest.studentId}
          variant="hidden"
          trigger={invoiceRequest.nonce}
        />
      )}
    </>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  destructive = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors ${
        destructive
          ? "text-red-600 hover:bg-red-50"
          : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
