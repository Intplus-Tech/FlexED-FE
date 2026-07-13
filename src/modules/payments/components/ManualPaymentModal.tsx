"use client";

import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetAllStudentQuery } from "@/redux/api/student";
import { useGetAllClassesQuery } from "@/redux/api/class";
import {
  useGetStudentFeeProfileQuery,
  useAllocateManualPaymentMutation,
} from "@/redux/api/transaction";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  Loader2,
  Search,
  X,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { showsuccess, showerror } from "@/utils/toast";
import { ManualAllocationRequest } from "@/@types/transaction";
import { useMemo, useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { formatNaira } from "@/utils/functions";
import { LogoLoader } from "@/components/ui/logo-loader";

interface ManualPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManualPaymentModal({
  isOpen,
  onClose,
}: ManualPaymentModalProps) {
  const authState = useSelector((state: RootState) => state.authState);
  const schoolId = String(authState.currentUser?.schoolId);

  const { data: studentsData, isLoading: isLoadingStudents } =
    useGetAllStudentQuery({ schoolId, limit: 1000 }, { skip: !schoolId });

  const { data: classesData } = useGetAllClassesQuery();

  const getClassName = (classId: string | any) => {
    if (!classId) return "N/A";
    if (typeof classId === 'object' && classId.name) return classId.name;
    const idToSearch = typeof classId === 'object' ? classId._id : classId;
    const foundClass = classesData?.data?.find((c) => c._id === idToSearch);
    return foundClass?.name || (typeof classId === 'string' ? classId : "Unknown");
  };

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: profileResponse, isLoading: isLoadingProfile } =
    useGetStudentFeeProfileQuery(selectedStudentId!, {
      skip: !selectedStudentId,
    });

  const [allocateManualPayment, { isLoading: isSubmitting }] =
    useAllocateManualPaymentMutation();

  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [manualTotalAmount, setManualTotalAmount] = useState<number>(0);
  const [autoDistribute, setAutoDistribute] = useState(false);

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      referenceNumber: "",
      dateOfPayment: new Date().toISOString().split("T")[0],
    },
  });

  // When "Automatically apply this amount to outstanding fees" is checked,
  // spread the entered Amount across outstanding fees in order, filling each
  // one's balance before moving to the next, until the amount runs out.
  useEffect(() => {
    if (autoDistribute && profileResponse?.data?.paymentItem) {
      let remaining = manualTotalAmount;
      const newAllocations: Record<string, number> = {};
      profileResponse.data.paymentItem.forEach((item) => {
        if (item.status === "COMPLETED" || remaining <= 0) return;
        const amountForItem = Math.min(item.currentBalance, remaining);
        if (amountForItem > 0) {
          newAllocations[item.paymentItemId] = amountForItem;
          remaining -= amountForItem;
        }
      });
      setAllocations(newAllocations);
    }
  }, [autoDistribute, manualTotalAmount, profileResponse]);

  const totalAllocated = useMemo(() => {
    return Object.values(allocations).reduce((sum, val) => sum + val, 0);
  }, [allocations]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsStudentDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedStudent = useMemo(() => {
    return studentsData?.data?.items?.find((s) => s._id === selectedStudentId);
  }, [selectedStudentId, studentsData]);

  const filteredStudents = useMemo(() => {
    if (!studentSearchQuery)
      return studentsData?.data?.items?.slice(0, 10) || [];
    return (
      studentsData?.data?.items?.filter((s) =>
        `${s.firstName} ${s.lastName} ${s.admissionNumber}`
          .toLowerCase()
          .includes(studentSearchQuery.toLowerCase()),
      ) || []
    );
  }, [studentSearchQuery, studentsData]);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return "text-green-600 border-gray-200 bg-white";
      case "PART_PAYMENT":
        return "text-orange-500 border-gray-200 bg-white";
      case "OUTSTANDING":
        return "text-red-500 border-gray-200 bg-white";
      default:
        return "text-gray-500 border-gray-200 bg-white";
    }
  };

  const handleAllocationChange = (paymentItemId: string, value: string) => {
    const numValue = parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
    setAllocations((prev) => ({
      ...prev,
      [paymentItemId]: numValue,
    }));
  };

  const onSubmit = async (data: any) => {
    if (!selectedStudentId) return showerror("Please select a student");
    if (!data.referenceNumber?.trim())
      return showerror("Please enter the teller / reference number");
    if (!manualTotalAmount || manualTotalAmount <= 0)
      return showerror("Please enter the expected amount");
    if (totalAllocated <= 0) return showerror("Please enter allocation amounts");
    const overAllocatedItem = profileResponse?.data?.paymentItem?.find(
      (item) => (allocations[item.paymentItemId] || 0) > item.currentBalance,
    );
    if (overAllocatedItem)
      return showerror(
        `Amount for ${overAllocatedItem.name} exceeds its outstanding balance`,
      );

    try {
      const payload: ManualAllocationRequest = {
        studentId: selectedStudentId,
        referenceNumber: data.referenceNumber,
        dateOfPayment: new Date(data.dateOfPayment).toISOString(),
        totalAmountPaid: manualTotalAmount,
        allocations: Object.entries(allocations)
          .filter(([_, amount]) => amount > 0)
          .map(([paymentItemId, amountAllocated]) => ({
            paymentItemId,
            amountAllocated,
          })),
      };

      await allocateManualPayment(payload).unwrap();
      showsuccess("Payment recorded successfully");
      setAllocations({});
      setSelectedStudentId(null);
      setManualTotalAmount(0);
      setAutoDistribute(false);
      reset();
      onClose();
    } catch (error: any) {
      showerror(error?.data?.message || "Failed to record payment");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl! h-[90vh] border-none shadow-2xl p-0 flex flex-col overflow-hidden">
        <DialogHeader className="p-6 border-b border-gray-200 bg-white shrink-0">
          <DialogTitle className="text-xl font-bold text-gray-900">
            Add New Payment
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
            {/* Select Student Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">
                Select Student
              </h3>

              <div className="relative" ref={dropdownRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search Student"
                    value={studentSearchQuery}
                    onChange={(e) => {
                      setStudentSearchQuery(e.target.value);
                      setIsStudentDropdownOpen(true);
                    }}
                    onFocus={() => setIsStudentDropdownOpen(true)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all shadow-sm"
                  />
                </div>

                {isStudentDropdownOpen && (
                  <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    {isLoadingStudents ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        Loading students...
                      </div>
                    ) : filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <button
                          key={student._id}
                          type="button"
                          onClick={() => {
                            setSelectedStudentId(student._id);
                            setStudentSearchQuery("");
                            setIsStudentDropdownOpen(false);
                            setAllocations({});
                            setManualTotalAmount(0);
                            setAutoDistribute(false);
                          }}
                          className="w-full p-4 text-left hover:bg-gray-50 flex items-center justify-between border-b last:border-0 border-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="size-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-xs">
                              {student.firstName[0]}
                              {student.lastName[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {student.firstName} {student.lastName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {student.admissionNumber} • {getClassName(student.class)}
                              </p>
                            </div>
                          </div>
                          {selectedStudentId === student._id && (
                            <CheckCircle2 className="size-5 text-purple-600" />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500">
                        No students found
                      </div>
                    )}
                  </div>
                )}
              </div>

              {selectedStudent && (
                <div className="relative p-5 bg-[#EDEEEF] rounded-2xl border border-gray-200 space-y-3 animate-in fade-in slide-in-from-top-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudentId(null);
                      setAllocations({});
                      setManualTotalAmount(0);
                      setAutoDistribute(false);
                    }}
                    className="absolute right-4 top-4 text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors"
                  >
                    <X size={18} />
                  </button>
                  <div className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-2">
                    <span className="text-sm font-medium text-gray-500">
                      Name:
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </span>
                    <span className="text-sm font-medium text-gray-500">
                      Class:
                    </span>
                    <span className="text-sm font-bold text-gray-900 uppercase">
                      {getClassName(selectedStudent.class)}
                    </span>
                    <span className="text-sm font-medium text-gray-500">
                      Expected Amount:
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {profileResponse?.data?.totalExpectedBalance !== undefined
                        ? formatNaira(profileResponse.data.totalExpectedBalance)
                        : "..."}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex flex-col space-y-1">
                <h3 className="text-lg font-bold text-gray-900">
                  Payment Details
                </h3>
                <div className="h-[1px] bg-gray-100 w-full" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">
                    Payment Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                    <input
                      type="date"
                      {...register("dateOfPayment")}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">
                    Teller / Reference no. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="727292101"
                    {...register("referenceNumber")}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">
                  Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900 font-medium">
                    ₦
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="0"
                    value={manualTotalAmount ? manualTotalAmount.toLocaleString() : ""}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value.replace(/[^0-9.]/g, "")) || 0;
                      setManualTotalAmount(val);
                    }}
                    className="w-full pl-8 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-lg font-medium text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Fee Breakdown Section */}
            <div className="space-y-4">
              <div className="flex flex-col space-y-1">
                <h3 className="text-lg font-bold text-gray-900">
                  Fee Breakdown
                </h3>
                <div className="h-[1px] bg-gray-100 w-full" />
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer select-none p-3 rounded-xl border border-purple-100 bg-purple-50/50">
                <input
                  type="checkbox"
                  checked={autoDistribute}
                  disabled={!profileResponse?.data?.paymentItem?.length}
                  onChange={(e) => setAutoDistribute(e.target.checked)}
                  className="size-4 mt-0.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500/20 disabled:opacity-50"
                />
                <span className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">
                    Automatically apply this amount to outstanding fees
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Useful when a parent pays a lump sum without saying which
                    fee it&apos;s for. Enter the total in the Amount field
                    below, and tick this box to have it applied to each
                    outstanding fee in order, fully covering one before
                    moving to the next. If the amount runs out before every
                    fee is covered, the fees still owing will be clearly
                    marked below. Untick to enter each fee&apos;s amount
                    yourself.
                  </p>
                </span>
              </label>

              <div className="space-y-2">
                {isLoadingProfile ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <LogoLoader size={56} />
                    <p className="text-sm text-gray-500">Fetching fee profile...</p>
                  </div>
                ) : profileResponse?.data?.paymentItem?.length ? (
                  <div className="space-y-4">
                    {profileResponse.data.paymentItem.map((item) => {
                      const enteredAmount =
                        allocations[item.paymentItemId] || 0;
                      const exceedsBalance =
                        enteredAmount > item.currentBalance;
                      const notCovered =
                        autoDistribute &&
                        item.status !== "COMPLETED" &&
                        item.currentBalance - enteredAmount > 0;

                      return (
                        <div
                          key={item.paymentItemId}
                          className="flex flex-col gap-1"
                        >
                          <div className="flex items-center gap-6 group min-h-[50px]">
                            {/* Status Badge */}
                            <div
                              className={cn(
                                "min-w-[140px] px-3 py-2.5 rounded-xl border text-sm font-medium flex items-center justify-center transition-all",
                                getStatusColor(item.status),
                              )}
                            >
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase().replace("_", " ")}
                            </div>

                            {/* Divider */}
                            <div className="w-[2px] h-6 bg-gray-200" />

                            {/* Fee Info */}
                            <div className="flex-1 flex items-center gap-4">
                              <span className="text-sm font-medium text-gray-400 flex-1">
                                {item.name}
                              </span>
                              <span className="text-sm font-bold text-gray-900">
                                {formatNaira(item.totalAmount)}
                                {item.status !== "COMPLETED" && (
                                  <span className="text-xs font-medium text-gray-400">
                                    {" "}
                                    (Bal= {formatNaira(item.currentBalance)})
                                  </span>
                                )}
                              </span>
                            </div>

                            {/* Right Section Divider and Input */}
                            {item.status !== "COMPLETED" && (
                              <>
                                <div className="w-[2px] h-6 bg-gray-200" />
                                <div
                                  className={cn(
                                    "relative w-48 group/input border rounded-xl bg-gray-50/30 transition-all focus-within:ring-2 focus-within:ring-purple-500/20 overflow-hidden",
                                    exceedsBalance
                                      ? "border-red-400 focus-within:border-red-400"
                                      : "border-gray-200 focus-within:border-purple-400 focus-within:bg-white",
                                  )}
                                >
                                  <input
                                    type="text"
                                    placeholder="Amount Paid ₦0"
                                    value={allocations[item.paymentItemId] ? `₦${allocations[item.paymentItemId].toLocaleString()}` : ""}
                                    onChange={(e) =>
                                      handleAllocationChange(
                                        item.paymentItemId,
                                        e.target.value,
                                      )
                                    }
                                    className="w-full px-3 py-2.5 bg-transparent text-sm font-medium text-gray-900 text-left outline-none placeholder:text-gray-400 placeholder:text-[11px]"
                                  />
                                </div>
                              </>
                            )}
                          </div>

                          {exceedsBalance && (
                            <p className="text-xs text-red-500 text-right">
                              Amount cannot exceed the outstanding balance of{" "}
                              {formatNaira(item.currentBalance)}
                            </p>
                          )}

                          {!exceedsBalance && notCovered && (
                            <p className="text-xs text-orange-500 text-right">
                              Not fully covered by this payment — still owing{" "}
                              {formatNaira(item.currentBalance - enteredAmount)}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : selectedStudentId ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <CheckCircle2 className="size-8 text-green-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      No outstanding fees for this student
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <AlertCircle className="size-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Select a student to view their fee profile
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="flex items-center justify-between gap-4 p-6 border-t border-gray-100 bg-white shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedStudentId}
              className="px-12 py-3 bg-[#9333EA] text-white rounded-xl font-bold hover:bg-[#7E22CE] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-200"
            >
              {isSubmitting && <Loader2 className="animate-spin" size={18} />}
              {isSubmitting ? "Allocating..." : "Confirm Allocation"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
