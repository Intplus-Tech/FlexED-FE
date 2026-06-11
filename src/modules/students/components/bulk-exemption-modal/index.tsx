"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShieldOff, ChevronDown } from "lucide-react";
import { useGetPaymentListQuery } from "@/redux/api/transaction";
import { useBulkExemptStudentsMutation } from "@/redux/api/student";
import { showerror, showsuccess } from "@/utils/toast";

interface BulkExemptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentIds: string[];
  onSuccess: () => void;
}

export function BulkExemptionModal({
  open,
  onOpenChange,
  studentIds,
  onSuccess,
}: BulkExemptionModalProps) {
  const { data: paymentItemsData, isLoading: isFetchingPayments } =
    useGetPaymentListQuery();

  const [paymentItemId, setPaymentItemId] = useState("");
  const [reason, setReason] = useState("");

  const [bulkExemptStudents, { isLoading }] = useBulkExemptStudentsMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentItemId) {
      showerror("Please select a payment item");
      return;
    }

    try {
      const res = await bulkExemptStudents({
        studentIds,
        paymentItem: paymentItemId,
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      }).unwrap();

      showsuccess(res?.message || "Exemptions applied successfully");
      onSuccess();
      onOpenChange(false);
      setPaymentItemId("");
      setReason("");
    } catch (error: any) {
      showerror(error?.data?.message || "Failed to apply bulk exemption");
    }
  };

  const paymentItems = paymentItemsData?.data?.items || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md bg-white p-8">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-100 p-2 rounded-lg">
              <ShieldOff className="w-5 h-5 text-orange-600" />
            </div>
            <DialogTitle className="text-2xl font-semibold text-gray-900">
              Bulk Exemption
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <p className="text-sm text-gray-600">
            You are exempting{" "}
            <span className="font-semibold text-orange-600">
              {studentIds.length}
            </span>{" "}
            selected student(s) from a payment item.
          </p>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Scholarship, financial hardship..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors text-gray-900 resize-none"
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
              disabled={isLoading || !paymentItemId}
              className="px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium disabled:opacity-50 transition-colors text-sm"
            >
              {isLoading ? "Applying..." : "Apply Exemption"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
