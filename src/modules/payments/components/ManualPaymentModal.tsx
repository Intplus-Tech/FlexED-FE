"use client";

import { useForm, useFieldArray } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetAllStudentQuery } from "@/redux/api/student";
import {
  useGetPaymentListQuery,
  useCollectManualPaymentMutation,
} from "@/redux/api/transaction";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { showsuccess, showerror } from "@/utils/toast";
import { CollectManualPaymentRequest } from "@/@types/transaction";

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

  const { data: feesData, isLoading: isLoadingFees } = useGetPaymentListQuery();
  const [collectManualPayment, { isLoading: isSubmitting }] =
    useCollectManualPaymentMutation();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CollectManualPaymentRequest>({
    defaultValues: {
      studentId: "",
      paidAllTogether: true,
      groupRef: "",
      payments: [
        {
          paymentItemId: "",
          receiptNumber: "",
          dateOfPayment: new Date().toISOString().split("T")[0],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "payments",
  });

  const onSubmit = async (data: CollectManualPaymentRequest) => {
    try {
      // Ensure date is in ISO format if needed, but the user requested HTML date picker which returns YYYY-MM-DD
      const payload = {
        ...data,
        payments: data.payments.map((p) => ({
          ...p,
          dateOfPayment: new Date(p.dateOfPayment).toISOString(),
        })),
      };

      await collectManualPayment(payload).unwrap();
      showsuccess("Payment recorded successfully");
      reset();
      onClose();
    } catch (error: any) {
      showerror(error?.data?.message || "Failed to record payment");
    }
  };

  const groupRef = watch("groupRef");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl! max-h-[90vh] border-none shadow-2xl p-0 flex flex-col">
        <DialogHeader className="p-6 pb-4 bg-gray-50/80 border-b shrink-0">
          <DialogTitle className="text-2xl font-bold text-gray-900 tracking-tight">
            Add Manual Payment
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 space-y-8 overflow-y-auto flex-1"
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900 ml-1">
                Select Student
              </label>
              <select
                {...register("studentId", { required: "Student is required" })}
                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all shadow-sm"
              >
                <option value="">Select a student</option>
                {studentsData?.data?.items?.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.firstName} {student.lastName} (
                    {student.admissionNumber})
                  </option>
                ))}
              </select>
              {errors.studentId && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors.studentId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900 ml-1">
                Group Receipt Number
              </label>
              <input
                {...register("groupRef", {
                  required: "Group receipt number is required",
                })}
                placeholder="e.g. RCPT-000200"
                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all shadow-sm"
                onChange={(e) => {
                  const val = e.target.value;
                  setValue("groupRef", val);
                  fields.forEach((_, index) => {
                    setValue(`payments.${index}.receiptNumber`, val);
                  });
                }}
              />
              {errors.groupRef && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors.groupRef.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 p-3 bg-purple-50/50 rounded-xl border border-purple-100/50">
              <input
                type="checkbox"
                id="paidAllTogether"
                {...register("paidAllTogether")}
                className="w-5 h-5 text-purple-600 rounded-md border-gray-300 focus:ring-purple-500 transition-colors"
              />
              <label
                htmlFor="paidAllTogether"
                className="text-sm font-medium text-purple-900"
              >
                Paid All Together
              </label>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">Payment Items</h3>
              <button
                type="button"
                onClick={() =>
                  append({
                    paymentItemId: "",
                    receiptNumber: groupRef,
                    dateOfPayment: new Date().toISOString().split("T")[0],
                  })
                }
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <Plus size={18} />
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-5 border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow relative space-y-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Item #{index + 1}
                    </span>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">
                        Fee / Payment Item
                      </label>
                      <select
                        {...register(
                          `payments.${index}.paymentItemId` as const,
                          {
                            required: "Fee is required",
                          },
                        )}
                        className="w-full p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                      >
                        <option value="">Select a fee</option>
                        {feesData?.data?.items?.map((fee) => (
                          <option key={fee._id} value={fee._id}>
                            {fee.name} — ₦{fee.amount.toLocaleString()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">
                        Receipt Number
                      </label>
                      <input
                        {...register(
                          `payments.${index}.receiptNumber` as const,
                          {
                            required: "Receipt number is required",
                          },
                        )}
                        placeholder="Receipt Number"
                        className="w-full p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">
                        Date of Payment
                      </label>
                      <input
                        type="date"
                        {...register(
                          `payments.${index}.dateOfPayment` as const,
                          {
                            required: "Date is required",
                          },
                        )}
                        className="w-full p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-200"
            >
              {isSubmitting && <Loader2 className="animate-spin" size={18} />}
              {isSubmitting ? "Processing..." : "Confirm Payment"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
