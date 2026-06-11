"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Loader } from "lucide-react";
import { showerror, showsuccess } from "@/utils/toast";
import { useAddStudentExemptionMutation } from "@/redux/api/student";

interface PaymentItem {
  paymentItemId: string;
  name: string;
  totalAmount: number;
}

interface StudentExemptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  paymentItems: PaymentItem[];
  /** Single-item mode: pre-fills the item, hides the selector */
  preSelectedPaymentItemId?: string;
  /** Multi-item mode: shows a list of items, fires parallel calls */
  preSelectedPaymentItemIds?: string[];
}

export function StudentExemptionModal({
  isOpen,
  onClose,
  studentId,
  paymentItems,
  preSelectedPaymentItemId,
  preSelectedPaymentItemIds,
}: StudentExemptionModalProps) {
  const [paymentItem, setPaymentItem] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [addExemption] = useAddStudentExemptionMutation();

  const isMultiMode =
    preSelectedPaymentItemIds && preSelectedPaymentItemIds.length > 0;

  useEffect(() => {
    if (isOpen) {
      setPaymentItem(preSelectedPaymentItemId ?? "");
      setReason("");
    }
  }, [isOpen, preSelectedPaymentItemId]);

  const handleClose = () => {
    setPaymentItem("");
    setReason("");
    onClose();
  };

  const preSelectedItem = preSelectedPaymentItemId
    ? paymentItems.find((i) => i.paymentItemId === preSelectedPaymentItemId)
    : null;

  const multiSelectedItems = isMultiMode
    ? preSelectedPaymentItemIds!
        .map((id) => paymentItems.find((i) => i.paymentItemId === id))
        .filter(Boolean) as PaymentItem[]
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedReason = reason.trim() || undefined;

    if (isMultiMode) {
      setIsSubmitting(true);
      try {
        await Promise.all(
          preSelectedPaymentItemIds!.map((itemId) =>
            addExemption({
              studentId,
              paymentItem: itemId,
              ...(trimmedReason ? { reason: trimmedReason } : {}),
            }).unwrap(),
          ),
        );
        showsuccess(
          `Exemption applied to ${preSelectedPaymentItemIds!.length} fee item(s).`,
        );
        handleClose();
      } catch (error: any) {
        showerror(error?.data?.message || "Failed to apply exemptions");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const itemId = preSelectedPaymentItemId ?? paymentItem;
    if (!itemId) {
      showerror("Please select a fee item.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addExemption({
        studentId,
        paymentItem: itemId,
        ...(trimmedReason ? { reason: trimmedReason } : {}),
      }).unwrap();
      showsuccess("Exemption applied successfully!");
      handleClose();
    } catch (error: any) {
      showerror(error?.data?.message || "Failed to apply exemption");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4">
          <DialogTitle className="text-lg font-bold text-gray-900">
            {isMultiMode
              ? `Exempt ${preSelectedPaymentItemIds!.length} Fee Item${preSelectedPaymentItemIds!.length > 1 ? "s" : ""}`
              : "Exempt from Payment"}
          </DialogTitle>
          <DialogClose className="text-gray-400 hover:text-gray-600 transition-colors" />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {isMultiMode ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Selected Fee Items
              </p>
              <ul className="bg-orange-50 border border-orange-100 rounded-xl divide-y divide-orange-100 overflow-hidden">
                {multiSelectedItems.map((item) => (
                  <li
                    key={item.paymentItemId}
                    className="flex items-center justify-between px-4 py-2.5"
                  >
                    <span className="text-sm font-semibold text-orange-900">
                      {item.name}
                    </span>
                    <span className="text-xs text-orange-600 font-medium">
                      ₦{item.totalAmount.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : preSelectedItem ? (
            <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-0.5">
                Fee Item
              </p>
              <p className="text-sm font-bold text-orange-900">
                {preSelectedItem.name}{" "}
                <span className="font-normal text-orange-700">
                  (₦{preSelectedItem.totalAmount.toLocaleString()})
                </span>
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Fee Item
              </label>
              <select
                value={paymentItem}
                onChange={(e) => setPaymentItem(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all appearance-none"
                required
              >
                <option value="" disabled>
                  Select fee item
                </option>
                {paymentItems?.map((item) => (
                  <option key={item.paymentItemId} value={item.paymentItemId}>
                    {item.name} (₦{item.totalAmount.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Reason{" "}
              <span className="text-gray-400 font-normal text-xs">
                (optional — leave blank if not needed)
              </span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Scholarship, financial hardship..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={
              isSubmitting ||
              (!isMultiMode && !preSelectedPaymentItemId && !paymentItem)
            }
            className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              "Apply Exemption"
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
