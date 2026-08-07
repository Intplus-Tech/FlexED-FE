"use client";

import { AlertCircle, CheckCircle2, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNaira } from "@/utils/functions";
import { LogoLoader } from "@/components/ui/logo-loader";
import { StudentFeeProfilePaymentItem } from "@/@types/transaction";

function getStatusColor(status: string) {
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
}

interface FeeBreakdownProps {
  paymentItems?: StudentFeeProfilePaymentItem[];
  isLoadingProfile: boolean;
  hasSelectedStudent: boolean;
  allocations: Record<string, number>;
  onAllocationChange: (paymentItemId: string, value: string) => void;
  autoDistribute: boolean;
  onAutoDistributeChange: (checked: boolean) => void;
  walletSurplus: number;
  totalWalletBalance: number;
}

export function FeeBreakdown({
  paymentItems,
  isLoadingProfile,
  hasSelectedStudent,
  allocations,
  onAllocationChange,
  autoDistribute,
  onAutoDistributeChange,
  walletSurplus,
  totalWalletBalance,
}: FeeBreakdownProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-1">
        <h3 className="text-lg font-bold text-gray-900">Fee Breakdown</h3>
        <div className="h-[1px] bg-gray-100 w-full" />
      </div>

      <label className="flex items-start gap-2.5 cursor-pointer select-none p-3 rounded-xl border border-purple-100 bg-purple-50/50">
        <input
          type="checkbox"
          checked={autoDistribute}
          disabled={!paymentItems?.length}
          onChange={(e) => onAutoDistributeChange(e.target.checked)}
          className="size-4 mt-0.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500/20 disabled:opacity-50"
        />
        <span className="flex flex-col">
          <span className="text-sm font-bold text-gray-900">
            Automatically apply this amount to outstanding fees
          </span>
          <p className="text-xs text-gray-500 mt-0.5">
            Useful when a parent pays a lump sum without saying which fee
            it&apos;s for. Enter the total in the Amount field below, and
            tick this box to have it applied to each outstanding fee in
            order, fully covering one before moving to the next. If the
            amount runs out before every fee is covered, the fees still
            owing will be clearly marked below. Untick to enter each fee&apos;s
            amount yourself.
          </p>
          {!autoDistribute && totalWalletBalance > 0 && (
            <p className="text-xs text-purple-600 mt-1.5 font-medium">
              This parent has {formatNaira(totalWalletBalance)} in wallet
              credit — checking this box will pull it into the Amount field
              automatically.
            </p>
          )}
        </span>
      </label>

      <div className="space-y-2">
        {isLoadingProfile ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <LogoLoader size={56} />
            <p className="text-sm text-gray-500">Fetching fee profile...</p>
          </div>
        ) : paymentItems?.length ? (
          <div className="space-y-4">
            {paymentItems.map((item) => {
              const enteredAmount = allocations[item.paymentItemId] || 0;
              const surplusAmount = Math.max(
                enteredAmount - item.currentBalance,
                0,
              );
              const exceedsBalance = surplusAmount > 0;
              const notCovered =
                autoDistribute &&
                item.status !== "COMPLETED" &&
                item.currentBalance - enteredAmount > 0;

              return (
                <div key={item.paymentItemId} className="flex flex-col gap-1">
                  <div className="flex items-center gap-6 group min-h-[50px]">
                    <div
                      className={cn(
                        "min-w-[140px] px-3 py-2.5 rounded-xl border text-sm font-medium flex items-center justify-center transition-all",
                        getStatusColor(item.status),
                      )}
                    >
                      {item.status.charAt(0).toUpperCase() +
                        item.status.slice(1).toLowerCase().replace("_", " ")}
                    </div>

                    <div className="w-[2px] h-6 bg-gray-200" />

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

                    {item.status !== "COMPLETED" && (
                      <>
                        <div className="w-[2px] h-6 bg-gray-200" />
                        <div
                          className={cn(
                            "relative w-48 group/input border rounded-xl bg-gray-50/30 transition-all focus-within:ring-2 focus-within:ring-purple-500/20 overflow-hidden",
                            exceedsBalance
                              ? "border-amber-400 focus-within:border-amber-400"
                              : "border-gray-200 focus-within:border-purple-400 focus-within:bg-white",
                          )}
                        >
                          <input
                            type="text"
                            placeholder="Amount Paid ₦0"
                            value={
                              allocations[item.paymentItemId]
                                ? `₦${allocations[item.paymentItemId].toLocaleString()}`
                                : ""
                            }
                            onChange={(e) =>
                              onAllocationChange(item.paymentItemId, e.target.value)
                            }
                            className="w-full px-3 py-2.5 bg-transparent text-sm font-medium text-gray-900 text-left outline-none placeholder:text-gray-400 placeholder:text-[11px]"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {exceedsBalance && (
                    <p className="text-xs text-amber-600 text-right">
                      This exceeds the balance — the extra{" "}
                      {formatNaira(surplusAmount)} will be credited to the
                      parent&apos;s wallet.
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

            {walletSurplus > 0 && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-purple-50 border border-purple-100">
                <Wallet size={16} className="text-purple-600 mt-0.5 shrink-0" />
                <p className="text-sm text-purple-700">
                  All outstanding fees are covered. The remaining{" "}
                  <span className="font-bold">{formatNaira(walletSurplus)}</span>{" "}
                  will be credited to the parent&apos;s wallet for future
                  payments.
                </p>
              </div>
            )}
          </div>
        ) : hasSelectedStudent ? (
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
  );
}
