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
import { useGetStudentByIdQuery } from "@/redux/api/student";
import { useGetStudentFeeProfileQuery } from "@/redux/api/transaction";
import { StudentDiscountModal } from "../student-discount-modal";

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
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

  const { data: studentData, isLoading: isStudentLoading } = useGetStudentByIdQuery(student?._id || "", {
    skip: !isOpen || !student?._id,
  });

  const { data: feeProfileResponse, isLoading: isFeeLoading } = useGetStudentFeeProfileQuery(student?._id || "", {
    skip: !isOpen || !student?._id,
  });

  const isLoading = isStudentLoading || isFeeLoading;

  if (!student) return null;

  const activeStudent = studentData || student;

  const getClassById = (classId: string | any) => {
    if (!classId) return "";
    if (typeof classId === "object" && classId.name) return classId.name;
    const idToSearch = typeof classId === "object" ? classId._id : classId;
    const classItem = classItems?.find((item) => item._id === idToSearch);
    return classItem ? classItem.name : (typeof classId === "string" ? classId : "");
  };

  const getStatusBadge = (paid: number, total: number) => {
    if (paid === 0) {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Unpaid
        </span>
      );
    }
    if (paid >= total) {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Fully Paid
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
        Partially Paid
      </span>
    );
  };

  const getFeeStatusBadge = (status: "COMPLETED" | "PART_PAYMENT" | "OUTSTANDING" | string) => {
    if (status === "COMPLETED") {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Fully Paid
        </span>
      );
    }
    if (status === "PART_PAYMENT") {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
          Partially Paid
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
        Unpaid
      </span>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl! w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between my-2 border-b border-gray-100 pb-3">
          <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
          <DialogClose className="text-gray-400 hover:text-gray-600 transition-colors" />
        </div>

        {isLoading ? (
          /* Premium Loading Skeleton */
          <div className="animate-pulse space-y-8 py-4">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-xl bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-6 w-48 bg-gray-200 rounded" />
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                </div>
              </div>

              {/* Fee Cards Skeleton */}
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-1">
                <div className="bg-gray-100 rounded-xl p-4 h-24 flex-1 lg:w-44" />
                <div className="bg-gray-100 rounded-xl p-4 h-24 flex-1 lg:w-44" />
                <div className="bg-gray-100 rounded-xl p-4 h-24 flex-1 lg:w-44" />
              </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="border-b border-gray-200 pb-3">
              <div className="flex gap-8">
                <div className="h-4 w-40 bg-gray-200 rounded" />
                <div className="h-4 w-28 bg-gray-200 rounded" />
                <div className="h-4 w-28 bg-gray-200 rounded" />
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="h-4 w-28 bg-gray-200 rounded" />
                  <div className="h-6 w-full bg-gray-100 rounded" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-6 w-full bg-gray-100 rounded" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="h-4 w-36 bg-gray-200 rounded" />
                  <div className="h-6 w-48 bg-gray-100 rounded" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-40 bg-gray-200 rounded" />
                  <div className="h-6 w-56 bg-gray-100 rounded" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader className="flex flex-col lg:flex-row items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <Image
                    src={studentData?.profileImageId?.url || "/images/avatar.svg"}
                    alt={`${activeStudent.firstName} ${activeStudent.lastName}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                    priority
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {activeStudent.firstName} {activeStudent.lastName}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Student ID: <span className="font-mono text-xs">{activeStudent._id}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Class: <span className="font-medium">{getClassById(activeStudent.class)}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Gender: <span className="font-medium capitalize">{activeStudent.gender?.toLowerCase() || "N/A"}</span>
                  </p>
                </div>
              </div>

              {/* Fee Summary Cards */}
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-1">
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex-1 lg:w-44">
                  <p className="text-xs text-green-600 font-semibold mb-1 uppercase tracking-wider">Total Paid</p>
                  <p className="text-2xl font-bold text-green-800">
                    ₦{(feeProfileResponse?.data?.paymentItem?.reduce((sum, item) => sum + item.amountPaidPreviously, 0) || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex-1 lg:w-44">
                  <p className="text-xs text-rose-600 font-semibold mb-1 uppercase tracking-wider">Outstanding</p>
                  <p className="text-2xl font-bold text-rose-800">
                    ₦{(feeProfileResponse?.data?.totalExpectedBalance || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </DialogHeader>

            {/* Tabs */}
            <div className="mt-8 border-b border-gray-200">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab("parent")}
                  className={`pb-3 text-sm font-semibold transition-all relative ${
                    activeTab === "parent"
                      ? "text-purple-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-purple-600"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Parent & Guardian Information
                </button>
                <button
                  onClick={() => setActiveTab("fees")}
                  className={`pb-3 text-sm font-semibold transition-all relative ${
                    activeTab === "fees"
                      ? "text-purple-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-purple-600"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Fees Information
                </button>
                <button
                  onClick={() => setActiveTab("payment")}
                  className={`pb-3 text-sm font-semibold transition-all relative ${
                    activeTab === "payment"
                      ? "text-purple-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-purple-600"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Payment Breakdown & Items
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="mt-8">
              {activeTab === "parent" && (
                <div className="space-y-6">
                  {activeStudent.parentDetails && activeStudent.parentDetails.length > 0 ? (
                    activeStudent.parentDetails.map((parent, index: number) => (
                      <div
                        key={parent._id || index}
                        className="bg-gray-50 border border-gray-100 rounded-xl p-6 space-y-4"
                      >
                        <h4 className="text-sm font-bold text-purple-600 uppercase tracking-wider">
                          {parent.relationship || "Guardian"} Details
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                          <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</label>
                            <p className="text-gray-900 font-semibold mt-1">
                              {parent.firstName} {parent.lastName}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
                            <p className="text-gray-900 font-medium mt-1 select-all">
                              {parent.email || "N/A"}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone Number</label>
                            <p className="text-gray-900 font-medium mt-1 select-all">
                              {parent.phone || "N/A"}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Relationship</label>
                            <p className="text-gray-900 font-semibold mt-1 capitalize">
                              {(parent.relationship || "PARENT").toLowerCase()}
                            </p>
                          </div>
                          {/* <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</label>
                            <div className="mt-1">
                              {parent.isRegistered ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                  Registered User
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                                  Pending Invite
                                </span>
                              )}
                            </div>
                          </div> */}
                          {parent.address && (
                            <div className="sm:col-span-2 md:col-span-3">
                              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Address</label>
                              <p className="text-gray-900 font-medium mt-1 select-all">
                                {parent.address}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                      No parent/guardian information associated with this student.
                    </div>
                  )}

                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Enrollment Date</label>
                      <p className="text-gray-900 font-semibold mt-1">
                        {activeStudent.createdAt
                          ? new Date(activeStudent.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Current Class</label>
                      <p className="text-gray-900 font-semibold mt-1">
                        {getClassById(activeStudent.class)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Fees Information Tab */}
              {activeTab === "fees" && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold text-gray-900">Assigned Fee Item Breakdown</h3>
                      <button
                        onClick={() => setIsDiscountModalOpen(true)}
                        className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors bg-purple-50 px-3 py-1.5 rounded-lg"
                      >
                        + Add Discount
                      </button>
                    </div>
                    {feeProfileResponse?.data?.paymentItem && feeProfileResponse.data.paymentItem.length > 0 ? (
                      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item Name</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Amount</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Paid So Far</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Outstanding</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {feeProfileResponse.data.paymentItem.map((item) => (
                              <tr key={item.paymentItemId} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">₦{item.totalAmount.toLocaleString()}</td>
                                <td className="px-6 py-4 text-sm text-green-600 font-semibold">₦{item.amountPaidPreviously.toLocaleString()}</td>
                                <td className="px-6 py-4 text-sm text-rose-600 font-semibold">₦{item.currentBalance.toLocaleString()}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                  {item.dueDate
                                    ? new Date(item.dueDate).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })
                                    : "No deadline"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                        No active fee components assigned to this student.
                      </div>
                    )}
                  </div>

                  {studentData?.discounts && studentData.discounts.length > 0 && (
                    <div className="border-t border-gray-100 pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-gray-900 font-semibold">Active Student Discounts</h3>
                        <button
                          onClick={() => setIsDiscountModalOpen(true)}
                          className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                        >
                          Manage Discounts
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {studentData.discounts.map((discount, idx) => (
                          <div
                            key={discount.paymentItem || idx}
                            className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between"
                          >
                            <div>
                              <p className="text-sm font-bold text-emerald-800">
                                {discount.type === "PERCENTAGE" ? `${discount.value}% Discount` : `₦${discount.value.toLocaleString()} Discount`}
                              </p>
                              <p className="text-xs text-emerald-600 mt-1">
                                Expires: {new Date(discount.expiresAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-800">
                              Active
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Payment History Tab */}
              {activeTab === "payment" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-4">Payment Item Summary</h3>
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fee Item</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Cost</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Paid</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Outstanding</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {feeProfileResponse?.data?.paymentItem && feeProfileResponse.data.paymentItem.length > 0 ? (
                            feeProfileResponse.data.paymentItem.map((item) => (
                              <tr key={item.paymentItemId} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">₦{item.totalAmount.toLocaleString()}</td>
                                <td className="px-6 py-4 text-sm text-green-600 font-semibold">₦{item.amountPaidPreviously.toLocaleString()}</td>
                                <td className="px-6 py-4 text-sm text-rose-600 font-semibold">₦{item.currentBalance.toLocaleString()}</td>
                                <td className="px-6 py-4 text-sm font-medium">
                                  {getFeeStatusBadge(item.status)}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="px-6 py-10 text-center text-gray-500 bg-gray-50">
                                No payment breakdown available.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>

      <StudentDiscountModal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        studentId={activeStudent?._id || ""}
        paymentItems={feeProfileResponse?.data?.paymentItem || []}
        existingDiscounts={studentData?.discounts || []}
      />
    </Dialog>
  );
}
