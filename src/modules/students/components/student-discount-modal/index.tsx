import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Loader } from "lucide-react";
import { showerror, showsuccess } from "@/utils/toast";
import { useAddStudentDiscountMutation } from "@/redux/api/student";

interface PaymentItem {
  paymentItemId: string;
  name: string;
  totalAmount: number;
}

interface StudentDiscount {
  paymentItem: string;
  type: "PERCENTAGE" | "FLAT";
  value: number;
  expiresAt: string;
}

interface StudentDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  paymentItems: PaymentItem[];
  existingDiscounts: StudentDiscount[];
}

export function StudentDiscountModal({
  isOpen,
  onClose,
  studentId,
  paymentItems,
  existingDiscounts,
}: StudentDiscountModalProps) {
  const [paymentItem, setPaymentItem] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FLAT">("PERCENTAGE");
  const [value, setValue] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const [addDiscount, { isLoading }] = useAddStudentDiscountMutation();

  // Pre-fill if existing discount is selected
  const handlePaymentItemChange = (selectedItemId: string) => {
    setPaymentItem(selectedItemId);
    const existing = existingDiscounts?.find(d => d.paymentItem === selectedItemId || (d as any).paymentItem?._id === selectedItemId);
    if (existing) {
      setType(existing.type);
      setValue(existing.value.toString());
      setExpiresAt(new Date(existing.expiresAt).toISOString().split("T")[0]);
    } else {
      setType("PERCENTAGE");
      setValue("");
      setExpiresAt("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentItem || !value || !expiresAt) {
      showerror("Please fill in all required fields.");
      return;
    }

    try {
      await addDiscount({
        studentId,
        paymentItem,
        type,
        value: Number(value),
        expiresAt: new Date(expiresAt).toISOString(),
      }).unwrap();

      showsuccess("Discount successfully applied!");
      setPaymentItem("");
      setValue("");
      setExpiresAt("");
      onClose();
    } catch (error: any) {
      showerror(error?.data?.message || "Failed to apply discount");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4">
          <DialogTitle className="text-lg font-bold text-gray-900">
            Apply/Edit Discount
          </DialogTitle>
          <DialogClose className="text-gray-400 hover:text-gray-600 transition-colors" />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Payment Item */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Fee Item
            </label>
            <select
              value={paymentItem}
              onChange={(e) => handlePaymentItemChange(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all appearance-none"
              required
            >
              <option value="" disabled>Select fee item</option>
              {paymentItems?.map((item) => (
                <option key={item.paymentItemId} value={item.paymentItemId}>
                  {item.name} (₦{item.totalAmount.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Discount Type */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "PERCENTAGE" | "FLAT")}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all appearance-none"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT">Flat Amount (₦)</option>
              </select>
            </div>

            {/* Discount Value */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Value</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={type === "PERCENTAGE" ? "10" : "5000"}
                min="1"
                max={type === "PERCENTAGE" ? "100" : undefined}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Expiry Date
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !paymentItem || !value || !expiresAt}
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              "Apply Discount"
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
