"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, Loader2, Plus } from "lucide-react";
import { LogoLoader } from "@/components/ui/logo-loader";
import { formatNaira, formatDate } from "@/utils/functions";
import { showerror, showsuccess } from "@/utils/toast";
import {
  useGetParentWalletQuery,
  useGetParentWalletLedgerQuery,
  useTopUpParentWalletMutation,
} from "@/redux/api/parent-wallet";
import { TopUpReason, WalletLedgerReason } from "@/@types/parent-wallet";

const REASON_COPY: Record<WalletLedgerReason, string> = {
  OVERPAYMENT: "Parent paid more than was owed",
  PAYMENT_APPLIED: "Credit applied to a fee",
  REFUND: "Credit returned outside the platform",
  ADJUSTMENT: "Manual correction",
  OPENING_BALANCE: "Credit carried over before joining FlexEdu",
};

const LIMIT = 10;

interface ParentWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId: string | null;
  parentName?: string;
}

export function ParentWalletModal({
  isOpen,
  onClose,
  parentId,
  parentName,
}: ParentWalletModalProps) {
  const [page, setPage] = useState(1);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState<TopUpReason>("OPENING_BALANCE");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");

  const { data: wallet, isFetching: isWalletLoading } = useGetParentWalletQuery(
    parentId as string,
    { skip: !isOpen || !parentId },
  );

  const { data: ledger, isFetching: isLedgerLoading } = useGetParentWalletLedgerQuery(
    { parentId: parentId as string, page, limit: LIMIT },
    { skip: !isOpen || !parentId },
  );

  const [topUpParentWallet, { isLoading: isSubmittingTopUp }] =
    useTopUpParentWalletMutation();

  const resetTopUpForm = () => {
    setAmount("");
    setReason("OPENING_BALANCE");
    setReference("");
    setNote("");
    setIsTopUpOpen(false);
  };

  const handleClose = () => {
    setPage(1);
    resetTopUpForm();
    onClose();
  };

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentId) return;
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      showerror("Enter a valid amount");
      return;
    }
    if (!reference.trim()) {
      showerror("A reference (receipt/ledger number) is required");
      return;
    }

    try {
      const res = await topUpParentWallet({
        parentId,
        amount: numericAmount,
        reason,
        reference: reference.trim(),
        note: note.trim() || undefined,
      }).unwrap();
      showsuccess(
        res.duplicate
          ? "This reference was already applied — no money moved"
          : `${formatNaira(res.amount)} credited to ${parentName || "the parent"}'s wallet`,
      );
      resetTopUpForm();
    } catch (error: any) {
      showerror(error?.data?.message || "Failed to top up wallet");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg w-full max-h-[85vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-bold text-gray-900">
            {parentName ? `${parentName}'s Wallet` : "Parent Wallet"}
          </DialogTitle>
          <DialogClose className="text-gray-400 hover:text-gray-600" />
        </DialogHeader>

        {isWalletLoading ? (
          <div className="flex justify-center py-10">
            <LogoLoader size={40} />
          </div>
        ) : (
          <div className="space-y-6 mt-2">
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-5">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
                Wallet Balance
              </p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {formatNaira(wallet?.balance ?? 0)}
              </p>
              {(wallet?.externalBalance ?? 0) > 0 && (
                <div className="flex gap-4 mt-3 text-xs text-purple-700">
                  <span>Off-platform: {formatNaira(wallet?.externalBalance ?? 0)}</span>
                  <span>Platform-held: {formatNaira(wallet?.platformBalance ?? 0)}</span>
                </div>
              )}
              <p className="text-xs text-purple-500 mt-2">
                This is held back from the school&apos;s payable wallet until the
                parent spends it.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900">Wallet History</h3>
                <button
                  onClick={() => setIsTopUpOpen((v) => !v)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus size={15} />
                  Top Up
                </button>
              </div>

              {isTopUpOpen && (
                <form
                  onSubmit={handleTopUp}
                  className="border border-gray-200 rounded-xl p-4 space-y-3 mb-4 bg-gray-50/50"
                >
                  <p className="text-xs text-gray-500">
                    Record credit the school already holds for this parent — e.g.
                    money paid ahead before joining the platform.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Amount
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Reason
                      </label>
                      <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value as TopUpReason)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="OPENING_BALANCE">Opening Balance</option>
                        <option value="ADJUSTMENT">Adjustment</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Reference (receipt/ledger number)
                    </label>
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g. LEGACY-2025-0001"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Note (optional)
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={resetTopUpForm}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingTopUp}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                      {isSubmittingTopUp && <Loader2 size={14} className="animate-spin" />}
                      {isSubmittingTopUp ? "Crediting..." : "Credit Wallet"}
                    </button>
                  </div>
                </form>
              )}

              {isLedgerLoading ? (
                <div className="flex justify-center py-8">
                  <LogoLoader size={32} />
                </div>
              ) : (ledger?.data ?? []).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  No wallet activity yet.
                </p>
              ) : (
                <div className="border border-gray-100 rounded-xl divide-y divide-gray-50 overflow-hidden">
                  {ledger?.data.map((entry) => {
                    const isCredit = entry.type === "CREDIT";
                    return (
                      <div
                        key={entry._id}
                        className="flex items-center justify-between gap-3 px-4 py-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                              isCredit ? "bg-green-50 text-green-600" : "bg-rose-50 text-rose-600"
                            }`}
                          >
                            {isCredit ? (
                              <ArrowDownLeft size={14} />
                            ) : (
                              <ArrowUpRight size={14} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {REASON_COPY[entry.reason] ?? entry.reason}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatDate(entry.createdAt, "DD MMM YYYY, h:mm A")}
                            </p>
                          </div>
                        </div>
                        <p
                          className={`text-sm font-semibold shrink-0 ${
                            isCredit ? "text-green-600" : "text-rose-600"
                          }`}
                        >
                          {isCredit ? "+" : "-"}
                          {formatNaira(entry.amount)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {ledger?.pagination && ledger.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-500">
                    Page {ledger.pagination.page} of {ledger.pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => p - 1)}
                      disabled={page <= 1}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= ledger.pagination.totalPages}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
