"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogClose,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Student } from "@/@types/student";
import { ClassItem } from "@/@types/class";

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  classItems: ClassItem[];
}

export function StudentProfileModal({
  isOpen,
  onClose,
  student,
  classItems,
}: StudentProfileModalProps) {
  const [activeTab, setActiveTab] = useState<"parent" | "fees" | "payment">(
    "parent",
  );

  if (!student) return null;

  const getClassById = (classId: string | any) => {
    if (!classId) return "";
    if (typeof classId === 'object' && classId.name) return classId.name;
    const idToSearch = typeof classId === 'object' ? classId._id : classId;
    const classItem = classItems?.find((item) => item._id === idToSearch);
    return classItem ? classItem.name : (typeof classId === 'string' ? classId : "");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl! w-full max-h-[90vh] overflow-y-auto">
        <h1 className="text-2xl font-medium my-2">Student Profile</h1>
        <DialogHeader className="flex flex-row items-start justify-between">
          <div className="flex items-start gap-6 flex-1">
            <div className="flex items-start gap-4">
              <Image
                src="/images/avatar.svg"
                alt="Student"
                height={80}
                width={80}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {student.firstName} {student.lastName}
                </h2>
                <p className="text-sm text-gray-600">
                  Student ID: {student._id}
                </p>
                <p className="text-sm text-gray-600">
                  Class: {getClassById(student.class)}
                </p>
                <p className="text-sm text-gray-600">Gender: Female</p>
              </div>
            </div>

            {/* Fee Summary Cards */}
            <div className="flex gap-4 flex-1">
              <div className="bg-purple-50 rounded-lg p-4 flex-1">
                <p className="text-xs text-gray-600 mb-1">Total Amount TD</p>
                <p className="text-2xl font-bold text-purple-600">₦0</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 flex-1">
                <p className="text-xs text-gray-600 mb-1">Outstanding TD</p>
                <p className="text-2xl font-bold text-red-600">₦0</p>
              </div>
            </div>
          </div>
          <DialogClose className="text-gray-400 hover:text-gray-600" />
        </DialogHeader>

        {/* Tabs */}
        <div className="mt-8 border-b border-gray-200">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("parent")}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === "parent"
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Parent Guardian Information
            </button>
            {/* <button
              onClick={() => setActiveTab("fees")}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === "fees"
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Fees Information
            </button>
            <button
              onClick={() => setActiveTab("payment")}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === "payment"
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Payment History
            </button> */}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === "parent" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-sm font-medium text-gray-900">
                    Gurdian&apos;s name:
                  </label>
                  <p className="text-gray-700 mt-1">{`${
                    student?.parentDetails?.[0]?.firstName ?? "N/A"
                  } ${student?.parentDetails?.[0]?.lastName}`}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-900">
                    Address:
                  </label>
                  <p className="text-gray-700 mt-1">
                    {/* Plot no. 116, 4, Bashorun Crescent, Ikoyi, Lagos */}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="flex items-center gap-2 text-gray-700 mt-1">
                    📞 {student?.parentDetails?.[0]?.phone ?? "N/A"}
                  </p>
                  <p className="flex items-center gap-2 text-gray-700 mt-1">
                    ✉️ {student?.parentDetails?.[0]?.email ?? "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-sm font-medium text-gray-900">
                    Join Date:
                  </label>
                  <p className="text-gray-700 mt-1">
                    {new Date(student?.createdAt).toDateString() ?? "N/A"}
                  </p>
                </div>
                {/* <div>
                  <label className="text-sm font-medium text-gray-900">
                    Mother&apos;s Contact
                  </label>
                  <p className="flex items-center gap-2 text-gray-700 mt-1">
                    📞 0701 234 9870
                  </p>
                  <p className="flex items-center gap-2 text-gray-700 mt-1">
                    ✉️ adebayoJulius@gmail.com
                  </p>
                </div> */}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">
                  Joined Class:
                </label>
                <p className="text-gray-700 mt-1">
                  {getClassById(student.class)}
                </p>
              </div>
            </div>
          )}

          {/* Fees Information Tab */}
          {activeTab === "fees" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-sm font-medium text-gray-900">
                    Present Fee Information
                  </label>
                  <div className="mt-4 space-y-3">
                    <p className="text-gray-700">
                      <span className="font-medium">First Term Fee:</span>{" "}
                      ₦500,000
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Second Term Fee:</span>{" "}
                      ₦500,000
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Third Term Fee:</span>{" "}
                      ₦500,000
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-900">
                    Total Fee:
                  </label>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    ₦1,500,000
                  </p>
                </div>
              </div>

              {/* <div className="border-t border-gray-200 pt-6">
                <label className="text-sm font-medium text-gray-900">
                  Address
                </label>
                <p className="text-gray-700 mt-2">
                  Plot no. 116, 4, Bashorun Crescent, Ikoyi, Lagos
                </p>
              </div> */}

              <div>
                <label className="text-sm font-medium text-gray-900">
                  Father&apos;s Contact
                </label>
                <p className="flex items-center gap-2 text-gray-700 mt-1">
                  📞 0701 234 9870
                </p>
                <p className="flex items-center gap-2 text-gray-700 mt-1">
                  ✉️ adebayoJulius@gmail.com
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">
                  Mother&apos;s Contact
                </label>
                <p className="flex items-center gap-2 text-gray-700 mt-1">
                  📞 0701 234 9870
                </p>
                <p className="flex items-center gap-2 text-gray-700 mt-1">
                  ✉️ adebayoJulius@gmail.com
                </p>
              </div>
            </div>
          )}

          {/* Payment History Tab */}
          {activeTab === "payment" && (
            <div>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                        Time / Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                        Tnx Ref
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                        Session
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                        Class
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                        Term
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                        Tuition Fees
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                        Paid
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                        Outstanding
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        Nov. 24th 2025
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        342355
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        2022/2023
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">SSS 3</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        First Term
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ₦150,000
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ₦150,000
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">NO</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <button className="text-gray-900 hover:text-purple-600">
                          ⊙
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        Nov. 24th 2025
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        342355
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        2022/2023
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">SSS 3</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        Second Term
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ₦150,000
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ₦150,000
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">NO</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <button className="text-gray-900 hover:text-purple-600">
                          ⊙
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        Nov. 24th 2025
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        342355
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        2022/2023
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">SSS 3</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        Third Term
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ₦150,000
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ₦150,000
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">NO</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <button className="text-gray-900 hover:text-purple-600">
                          ⊙
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
