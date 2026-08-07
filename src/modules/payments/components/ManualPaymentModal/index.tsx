"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Loader2 } from "lucide-react";
import { showsuccess, showerror } from "@/utils/toast";
import { ManualAllocationRequest } from "@/@types/transaction";
import { useMemo, useState, useEffect } from "react";
import { formatNaira } from "@/utils/functions";
import { StudentSearch } from "./student-search";
import { SelectedStudentCard } from "./selected-student-card";
import { PaymentDetailsFields } from "./payment-details-fields";
import { FeeBreakdown } from "./fee-breakdown";
import { useCombinedParentWalletBalance } from "./use-combined-parent-wallet-balance";
import { ManualPaymentFormValues } from "./types";

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
    if (typeof classId === "object" && classId.name) return classId.name;
    const idToSearch = typeof classId === "object" ? classId._id : classId;
    const foundClass = classesData?.data?.find((c) => c._id === idToSearch);
    return foundClass?.name || (typeof classId === "string" ? classId : "Unknown");
  };

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );

  const { data: profileResponse, isLoading: isLoadingProfile } =
    useGetStudentFeeProfileQuery(selectedStudentId!, {
      skip: !selectedStudentId,
    });

  const [allocateManualPayment, { isLoading: isSubmitting }] =
    useAllocateManualPaymentMutation();

  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [manualTotalAmount, setManualTotalAmount] = useState<number>(0);
  const [autoDistribute, setAutoDistribute] = useState(false);

  const { register, handleSubmit, reset } = useForm<ManualPaymentFormValues>({
    defaultValues: {
      referenceNumber: "",
      dateOfPayment: new Date().toISOString().split("T")[0],
    },
  });

  const selectedStudent = useMemo(() => {
    return studentsData?.data?.items?.find((s) => s._id === selectedStudentId);
  }, [selectedStudentId, studentsData]);

  const parentIds = useMemo(
    () => selectedStudent?.parentDetails?.map((p) => p._id) ?? [],
    [selectedStudent],
  );
  const { infoByParentId, total: totalWalletBalance } =
    useCombinedParentWalletBalance(parentIds);

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

  // Once auto-distribute has covered every outstanding fee, anything left
  // over from the entered amount isn't allocated to anything — the API
  // banks it straight to the parent's wallet, so surface that up front.
  const walletSurplus = autoDistribute
    ? Math.max(manualTotalAmount - totalAllocated, 0)
    : 0;

  const resetPaymentState = () => {
    setAllocations({});
    setManualTotalAmount(0);
    setAutoDistribute(false);
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    resetPaymentState();
  };

  const handleClearStudent = () => {
    setSelectedStudentId(null);
    resetPaymentState();
  };

  // Checking the box is also a shortcut for "use whatever this parent
  // already has in their wallet" — if there's a balance, pull it into the
  // Amount field before running the normal per-item distribution.
  const handleAutoDistributeChange = (checked: boolean) => {
    setAutoDistribute(checked);
    if (checked && totalWalletBalance > 0) {
      setManualTotalAmount(totalWalletBalance);
    }
  };

  const handleAllocationChange = (paymentItemId: string, value: string) => {
    const numValue = parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
    setAllocations((prev) => ({
      ...prev,
      [paymentItemId]: numValue,
    }));
  };

  const onSubmit = async (data: ManualPaymentFormValues) => {
    if (!selectedStudentId) return showerror("Please select a student");
    if (!data.referenceNumber?.trim())
      return showerror("Please enter the teller / reference number");
    if (!manualTotalAmount || manualTotalAmount <= 0)
      return showerror("Please enter the expected amount");
    if (totalAllocated <= 0) return showerror("Please enter allocation amounts");

    try {
      const payload: ManualAllocationRequest = {
        studentId: selectedStudentId,
        referenceNumber: data.referenceNumber,
        dateOfPayment: new Date(data.dateOfPayment).toISOString(),
        totalAmountPaid: manualTotalAmount,
        allocations: Object.entries(allocations)
          .filter(([, amount]) => amount > 0)
          .map(([paymentItemId, amountAllocated]) => ({
            paymentItemId,
            amountAllocated,
          })),
      };

      const res = await allocateManualPayment(payload).unwrap();
      const surplusCredited = res?.data?.surplusCredited ?? 0;
      showsuccess(
        surplusCredited > 0
          ? `Payment recorded — ${formatNaira(surplusCredited)} credited to the parent's wallet`
          : "Payment recorded successfully",
      );
      handleClearStudent();
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
          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">
                Select Student
              </h3>

              <StudentSearch
                students={studentsData?.data?.items ?? []}
                isLoading={isLoadingStudents}
                selectedStudentId={selectedStudentId}
                getClassName={getClassName}
                onSelect={handleSelectStudent}
              />

              {selectedStudent && (
                <SelectedStudentCard
                  student={selectedStudent}
                  className={getClassName(selectedStudent.class)}
                  expectedAmount={profileResponse?.data?.totalExpectedBalance}
                  walletInfoByParentId={infoByParentId}
                  onClear={handleClearStudent}
                />
              )}
            </div>

            <PaymentDetailsFields
              register={register}
              manualTotalAmount={manualTotalAmount}
              onAmountChange={setManualTotalAmount}
            />

            <FeeBreakdown
              paymentItems={profileResponse?.data?.paymentItem}
              isLoadingProfile={isLoadingProfile}
              hasSelectedStudent={!!selectedStudentId}
              allocations={allocations}
              onAllocationChange={handleAllocationChange}
              autoDistribute={autoDistribute}
              onAutoDistributeChange={handleAutoDistributeChange}
              walletSurplus={walletSurplus}
              totalWalletBalance={totalWalletBalance}
            />
          </div>

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
