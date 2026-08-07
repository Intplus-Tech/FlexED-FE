"use client";

import { Calendar } from "lucide-react";
import { UseFormRegister } from "react-hook-form";
import { ManualPaymentFormValues } from "./types";

interface PaymentDetailsFieldsProps {
  register: UseFormRegister<ManualPaymentFormValues>;
  manualTotalAmount: number;
  onAmountChange: (value: number) => void;
}

export function PaymentDetailsFields({
  register,
  manualTotalAmount,
  onAmountChange,
}: PaymentDetailsFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-1">
        <h3 className="text-lg font-bold text-gray-900">Payment Details</h3>
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
              onAmountChange(val);
            }}
            className="w-full pl-8 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-lg font-medium text-gray-900"
          />
        </div>
      </div>
    </div>
  );
}
