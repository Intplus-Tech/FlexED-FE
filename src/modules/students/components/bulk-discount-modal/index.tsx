"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronDown, Percent } from "lucide-react";
import { useGetPaymentListQuery } from "@/redux/api/transaction";
import { useBulkDiscountStudentsMutation } from "@/redux/api/student";
import { showerror, showsuccess } from "@/utils/toast";

interface BulkDiscountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentIds: string[];
  onSuccess: () => void;
}

export function BulkDiscountModal({
  open,
  onOpenChange,
  studentIds,
  onSuccess,
}: BulkDiscountModalProps) {
  const { data: paymentItemsData, isLoading: isFetchingPayments } =
    useGetPaymentListQuery();

  const [paymentItemId, setPaymentItemId] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FLAT">("PERCENTAGE");
  const [value, setValue] = useState<number>(0);
  const [expiresAt, setExpiresAt] = useState<string>(() => {
    // Default to 30 days from now at end of day (23:59:59)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    return futureDate.toISOString().split("T")[0]; // YYYY-MM-DD
  });

  const [bulkDiscountStudents, { isLoading }] = useBulkDiscountStudentsMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentItemId) {
      showerror("Please select a payment item");
      return;
    }
    if (value <= 0) {
      showerror("Please enter a valid discount value");
      return;
    }
    if (discountType === "PERCENTAGE" && value > 100) {
      showerror("Percentage discount cannot exceed 100%");
      return;
    }

    try {
      // Construct date string ending at 23:59:59.000Z
      const dateISO = new Date(`${expiresAt}T23:59:59.000Z`).toISOString();

      const res = await bulkDiscountStudents({
        studentIds,
        paymentItem: paymentItemId,
        type: discountType,
        value,
        expiresAt: dateISO,
      }).unwrap();

      showsuccess(res?.message || "Discounts applied successfully");
      onSuccess();
      onOpenChange(false);
      // Reset form
      setPaymentItemId("");
      setDiscountType("PERCENTAGE");
      setValue(0);
    } catch (error: any) {
      showerror(
        error?.data?.message || "Failed to apply bulk discount"
      );
    }
  };

  const paymentItems = paymentItemsData?.data?.items || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md bg-white p-8">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Percent className="w-5 h-5 text-indigo-600" />
            </div>
            <DialogTitle className="text-2xl font-semibold text-gray-900">
              Bulk Discount
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <p className="text-sm text-gray-600">
            You are applying a discount to <span className="font-semibold text-indigo-600">{studentIds.length}</span> selected student(s).
          </p>

          {/* Payment Item */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Fee / Payment Item
            </label>
            <div className="relative">
              <select
                disabled={isFetchingPayments}
                value={paymentItemId}
                onChange={(e) => setPaymentItemId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-white pr-10 text-gray-900 disabled:opacity-50"
              >
                <option value="">
                  {isFetchingPayments ? "Loading items..." : "Choose fee item"}
                </option>
                {paymentItems.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name} (₦{item.amount.toLocaleString()})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Discount Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Type
            </label>
            <div className="relative">
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as "PERCENTAGE" | "FLAT")}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-white pr-10 text-gray-900"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT">Fixed Amount (₦)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Value {discountType === "PERCENTAGE" ? "(%)" : "(₦)"}
            </label>
            <input
              type="number"
              min="0.01"
              step="any"
              value={value || ""}
              onChange={(e) => setValue(parseFloat(e.target.value))}
              placeholder={discountType === "PERCENTAGE" ? "e.g., 10" : "e.g., 5000"}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors text-gray-900"
            />
          </div>

          {/* Expires At */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors text-gray-900 bg-white"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !paymentItemId || value <= 0}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium disabled:opacity-50 transition-colors text-sm"
            >
              {isLoading ? "Applying..." : "Apply Discount"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
