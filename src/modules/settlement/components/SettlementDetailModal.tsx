import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Clock, Check, Copy } from "lucide-react";
import { useState } from "react";
import { useGetPayoutByIdQuery } from "@/redux/api/payout";
import { LogoLoader } from "@/components/ui/logo-loader";

interface SettlementDetailModalProps {
  payoutId: string | null;
  onClose: () => void;
}

export function SettlementDetailModal({
  payoutId,
  onClose,
}: SettlementDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { data: selectedPayout, isFetching } = useGetPayoutByIdQuery(
    payoutId as string,
    { skip: !payoutId }
  );

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatFullDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Dialog open={!!payoutId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg! w-full">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4">
          <DialogTitle className="text-lg font-bold text-gray-900">
            Payout Details
          </DialogTitle>
          <DialogClose className="text-gray-400 hover:text-gray-600 transition-colors" />
        </DialogHeader>

        {isFetching ? (
          <div className="flex flex-col items-center justify-center py-12">
            <LogoLoader size={56} />
            <span className="text-sm font-semibold text-gray-500 mt-3">
              Loading payout details...
            </span>
          </div>
        ) : selectedPayout ? (
          <div className="space-y-5 pt-2">
            {/* Status Banner */}
            <div
              className={`rounded-xl p-4 flex items-center gap-3 ${
                selectedPayout.status === "SUCCESS"
                  ? "bg-green-50 border border-green-100"
                  : selectedPayout.status === "FAILED"
                  ? "bg-red-50 border border-red-100"
                  : "bg-amber-50 border border-amber-100"
              }`}
            >
              {selectedPayout.status === "SUCCESS" ? (
                <CheckCircle2 size={24} className="text-green-600" />
              ) : selectedPayout.status === "FAILED" ? (
                <XCircle size={24} className="text-red-600" />
              ) : (
                <Clock size={24} className="text-amber-600" />
              )}
              <div>
                <p className="text-sm font-bold">
                  {selectedPayout.status === "SUCCESS"
                    ? "Payout Successful"
                    : selectedPayout.status === "FAILED"
                    ? "Payout Failed"
                    : "Payout Pending"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatFullDate(selectedPayout.createdAt)}
                </p>
              </div>
            </div>

            {/* Amount */}
            <div className="bg-gray-50 rounded-xl p-5 text-center border border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Settlement Amount
              </p>
              <p className="text-3xl font-bold text-gray-900">
                ₦
                {selectedPayout.amount.toLocaleString("en-NG", {
                  minimumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Fee: ₦
                {selectedPayout.feeAmount.toLocaleString("en-NG", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>

            {/* Details Grid */}
            <div className="space-y-3">
              {[
                {
                  label: "Provider Reference",
                  value: selectedPayout.providerReference,
                  copyable: true,
                  key: "provRef",
                },
                {
                  label: "NIP Reference",
                  value: selectedPayout.providerNipReference,
                  copyable: true,
                  key: "nipRef",
                },
                {
                  label: "Settlement Account",
                  value: selectedPayout.settlementAccount,
                  copyable: false,
                  key: "account",
                },
                {
                  label: "Created At",
                  value: formatFullDate(selectedPayout.createdAt),
                  copyable: false,
                  key: "created",
                },
                {
                  label: "Updated At",
                  value: formatFullDate(selectedPayout.updatedAt),
                  copyable: false,
                  key: "updated",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
                >
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 font-mono max-w-[200px] truncate">
                      {item.value}
                    </span>
                    {item.copyable && (
                      <button
                        onClick={() => handleCopy(item.value, item.key)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                        title="Copy to clipboard"
                      >
                        {copiedField === item.key ? (
                          <Check size={14} className="text-green-600" />
                        ) : (
                          <Copy size={14} className="text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
