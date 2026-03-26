"use client";

import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInitiateSmsTopupMutation } from "@/redux/api/sms";
import { Loader2 } from "lucide-react";
import { showerror } from "@/utils/toast";

interface SmsTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  amount: number;
}

export function SmsTopUpModal({ isOpen, onClose }: SmsTopUpModalProps) {
  const [initiateTopup, { isLoading }] = useInitiateSmsTopupMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      amount: 2500,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await initiateTopup({
        amount: Number(data.amount),
        callbackUrl: `${window.location.origin}/dashboard`,
      }).unwrap();

      if (response.success && response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      }
    } catch (error: any) {
      showerror(error?.data?.message || "Failed to initiate top-up");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] border-none shadow-2xl">
        <DialogHeader className="pb-4 border-b border-purple-200">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            SMS Top Up
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900 ml-1">
              Top-up Amount (₦)
            </label>
            <input
              type="number"
              {...register("amount", {
                required: "Amount is required",
                min: { value: 100, message: "Minimum amount is ₦100" },
              })}
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-lg font-medium"
              placeholder="e.g. 2500"
            />
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1 ml-1">
                {errors.amount.message}
              </p>
            )}
            <p className="text-[11px] text-gray-500 italic mt-3 leading-relaxed px-1">
              Note: You will be securely redirected to our payment provider to
              complete the transaction.
            </p>
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
              disabled={isLoading}
              className="px-8 py-3 bg-purple-900 text-white rounded-xl font-bold hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-200"
            >
              {isLoading && <Loader2 className="animate-spin" size={18} />}
              {isLoading ? "Processing..." : "Proceed to Payment"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
