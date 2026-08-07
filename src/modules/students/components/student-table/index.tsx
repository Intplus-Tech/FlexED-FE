"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import StudentTableLoader from "../../Loader/table-loader";
import { StudentProfileModal } from "../student-profile";
import { GetStudentsResponse, Student } from "@/@types/student";
import { ClassItem } from "@/@types/class";
import { useDeleteStudentMutation } from "@/redux/api/student";
import { DeleteModal } from "@/components/delete-modal";
import { showerror, showsuccess } from "@/utils/toast";
import { Eye, Trash2, Pencil, GraduationCap, MoreVertical, Download, FileText } from "lucide-react";
import { PromoteStudentModal } from "../promote-student-modal";
import { StudentReceiptButton } from "../student-receipt";
import { StudentInvoiceButton } from "../student-invoice";

const MENU_WIDTH = 208;

interface StudentTableProps {
  students: GetStudentsResponse;
  isLoading?: boolean;
  classItems: ClassItem[];
  selectedStudentIds: string[];
  setSelectedStudentIds: React.Dispatch<React.SetStateAction<string[]>>;
  onEditStudent: (id: string) => void;
}

export function StudentTable({
  students,
  isLoading = false,
  classItems,
  selectedStudentIds,
  setSelectedStudentIds,
  onEditStudent,
}: StudentTableProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [studentToPromote, setStudentToPromote] = useState<Student | null>(null);
  const [openMenuFor, setOpenMenuFor] = useState<Student | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [receiptRequest, setReceiptRequest] = useState<{ studentId: string; nonce: number } | null>(null);
  const [invoiceRequest, setInvoiceRequest] = useState<{ studentId: string; nonce: number } | null>(null);

  const [deleteStudent, { isLoading: isDeleteLoading }] =
    useDeleteStudentMutation();

  const closeMenu = () => {
    setOpenMenuFor(null);
    setMenuPosition(null);
  };

  const toggleMenu = (student: Student, e: React.MouseEvent<HTMLButtonElement>) => {
    if (openMenuFor?._id === student._id) {
      closeMenu();
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({ top: rect.bottom + 6, left: rect.right - MENU_WIDTH });
    setOpenMenuFor(student);
  };

  useEffect(() => {
    if (!openMenuFor) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) closeMenu();
    };
    const handleScroll = () => closeMenu();
    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [openMenuFor]);

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return <StudentTableLoader />;
  }

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

  const handleDeleteStudent = (student: Student) => {
    setStudentToDelete(student);
    setIsDeleteModalOpen(true);
  };

  const handlePromoteStudent = (student: Student) => {
    setStudentToPromote(student);
    setIsPromoteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    try {
      const res = await deleteStudent(studentToDelete._id).unwrap();
      showsuccess(res.message || "Student deleted successfully");
      setIsDeleteModalOpen(false);
    } catch (error: any) {
      showerror(error?.data?.message || "Failed to delete student");
    }
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
                    checked={
                      students?.data?.items?.length > 0 &&
                      students.data.items.every((student) =>
                        selectedStudentIds.includes(student._id),
                      )
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        const allIds =
                          students?.data?.items?.map(
                            (student) => student._id,
                          ) || [];
                        setSelectedStudentIds(allIds);
                      } else {
                        setSelectedStudentIds([]);
                      }
                    }}
                    className="w-4 h-4 border-2 border-gray-300 rounded cursor-pointer accent-purple-500 focus:ring-purple-500 text-purple-600"
                  />
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
              {/* <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 whitespace-nowrap">
                Amount Fee
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 whitespace-nowrap">
                Paid TD
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 whitespace-nowrap">
                Balance
              </th> */}
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students?.data?.items?.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center h-80">
                  No data available
                </td>
              </tr>
            ) : (
              students?.data?.items?.map((student) => {
                if (student.isDeleted) return;
                return (
                  <tr
                    key={student._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.includes(student._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudentIds((prev) => [
                                ...prev,
                                student._id,
                              ]);
                            } else {
                              setSelectedStudentIds((prev) =>
                                prev.filter((id) => id !== student._id),
                              );
                            }
                          }}
                          className="w-4 h-4 border-2 border-gray-300 rounded cursor-pointer accent-purple-500 focus:ring-purple-500 text-purple-600"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {`${student.firstName} ${student.lastName}`}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {student.admissionNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {getClassById(student.class)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {student.gender}
                    </td>

                    {/* <td className="px-6 py-4 text-sm font-medium text-gray-900"> */}
                    {/* {"-"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {"-"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {"-"}
                    </td> */}
                    <td className="px-6 py-4">
                      <button
                        disabled={selectedStudentIds.length > 0}
                        onClick={(e) => toggleMenu(student, e)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="More actions"
                      >
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {openMenuFor &&
        menuPosition &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: "fixed", top: menuPosition.top, left: menuPosition.left, width: MENU_WIDTH }}
            className="bg-white border border-gray-200 rounded-lg shadow-lg py-1.5 z-50"
          >
            <button
              onClick={() => {
                handleViewStudent(openMenuFor);
                closeMenu();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left transition-colors"
            >
              <Eye size={15} />
              View Student
            </button>
            <button
              onClick={() => {
                onEditStudent(openMenuFor._id);
                closeMenu();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left transition-colors"
            >
              <Pencil size={15} />
              Edit Student
            </button>
            <button
              onClick={() => {
                setReceiptRequest({ studentId: openMenuFor._id, nonce: Date.now() });
                closeMenu();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left transition-colors"
            >
              <Download size={15} />
              Download Receipt
            </button>
            <button
              onClick={() => {
                setInvoiceRequest({ studentId: openMenuFor._id, nonce: Date.now() });
                closeMenu();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left transition-colors"
            >
              <FileText size={15} />
              Download Invoice
            </button>
            <button
              onClick={() => {
                handlePromoteStudent(openMenuFor);
                closeMenu();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left transition-colors"
            >
              <GraduationCap size={15} />
              Promote Student
            </button>
            <div className="my-1 border-t border-gray-100" />
            <button
              onClick={() => {
                handleDeleteStudent(openMenuFor);
                closeMenu();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left transition-colors"
            >
              <Trash2 size={15} />
              Delete Student
            </button>
          </div>,
          document.body,
        )}

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
    </div>
  );
}
