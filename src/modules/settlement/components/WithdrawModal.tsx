"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Loader } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreatePayoutMutation,
  useGetSchoolWalletQuery,
  useGetSettlementAccountsQuery,
} from "@/redux/api/payout";
import { normalizeError } from "@/lib/api-error";
import { formatKobo, koboToNaira, nairaToKobo } from "@/utils/functions";
import { showerror, showsuccess } from "@/utils/toast";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
}

export function WithdrawModal({
  isOpen,
  onClose,
  schoolId,
}: WithdrawModalProps) {
  const [amount, setAmount] = useState("");
  // null means "the user hasn't picked one" — the primary account then stands
  // in, so the default is derived rather than written back by an effect.
  const [chosenAccountId, setChosenAccountId] = useState<string | null>(null);

  const { data: accounts, isFetching: isLoadingAccounts } =
    useGetSettlementAccountsQuery(schoolId, { skip: !isOpen || !schoolId });
  const { data: wallet } = useGetSchoolWalletQuery(undefined, { skip: !isOpen });

  const [createPayout, { isLoading: isCreating }] = useCreatePayoutMutation();

  // Default to the primary account — it's the one the backend would pick anyway
  // when `settlementAccountId` is omitted, so preselecting it matches the
  // server's own behaviour instead of making the user restate it.
  const settlementAccountId =
    chosenAccountId ??
    (accounts?.find((a) => a.isPrimary) ?? accounts?.[0])?._id ??
    "";

  const balanceKobo = wallet?.balance ?? 0;
  const amountNaira = Number(amount);
  const amountIsValid =
    amount !== "" && !isNaN(amountNaira) && amountNaira > 0;
  // The typed figure is Naira; the API takes kobo. Compare in kobo so the
  // balance check and the request agree on units.
  const amountKobo = amountIsValid ? nairaToKobo(amountNaira) : 0;
  const exceedsBalance = amountIsValid && amountKobo > balanceKobo;

  const selectedAccount = useMemo(
    () => accounts?.find((a) => a._id === settlementAccountId),
    [accounts, settlementAccountId]
  );
  // The provider needs a NIP bank code to send the transfer; without it the
  // request fails at the gateway with a 400 the user can't act on from here.
  const missingBankCode = !!selectedAccount && !selectedAccount.bankCode;

  const handleClose = () => {
    setAmount("");
    setChosenAccountId(null);
    onClose();
  };

  const handleWithdraw = async () => {
    if (!amountIsValid) {
      showerror("Please enter a valid amount");
      return;
    }
    if (!settlementAccountId) {
      showerror("Please select a settlement account");
      return;
    }
    if (exceedsBalance) {
      showerror("Amount is more than your available wallet balance");
      return;
    }

    try {
      await createPayout({
        amount: amountKobo,
        settlementAccountId,
      }).unwrap();

      showsuccess("Withdrawal initiated successfully");
      handleClose();
    } catch (error) {
      showerror(
        normalizeError(error).message || "Failed to initiate withdrawal"
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4">
          <DialogTitle className="text-lg font-bold text-gray-900">
            Withdraw Funds
          </DialogTitle>
          <DialogClose className="cursor-pointer text-gray-400 transition-colors hover:text-gray-600" />
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
            <span className="text-sm text-gray-500">Available balance</span>
            <span className="text-sm font-bold text-gray-900">
              {formatKobo(balanceKobo)}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="withdraw-amount"
                className="text-sm font-semibold text-gray-700"
              >
                Amount
              </label>
              <button
                type="button"
                onClick={() => setAmount(String(koboToNaira(balanceKobo)))}
                disabled={balanceKobo <= 0}
                className="cursor-pointer text-xs font-semibold text-purple-600 transition-colors hover:text-purple-800 disabled:cursor-not-allowed disabled:text-gray-300"
              >
                Withdraw all
              </button>
            </div>
            <div className="relative">
              <span className="absolute top-1/2 left-3 -translate-y-1/2 font-medium text-gray-500">
                ₦
              </span>
              <input
                id="withdraw-amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-4 pl-8 transition-all focus:border-transparent focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>
            {exceedsBalance ? (
              <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                <AlertCircle size={13} />
                That&apos;s more than your available balance of{" "}
                {formatKobo(balanceKobo)}.
              </p>
            ) : (
              <p className="text-xs text-gray-400">
                A payout fee is deducted from your wallet on top of this amount.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="settlement-account"
              className="text-sm font-semibold text-gray-700"
            >
              Settlement Account
            </label>
            {isLoadingAccounts ? (
              <div className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-400">
                <span>Loading accounts...</span>
                <Loader className="size-4 animate-spin" />
              </div>
            ) : accounts && accounts.length > 0 ? (
              <>
                <select
                  id="settlement-account"
                  value={settlementAccountId}
                  onChange={(e) => setChosenAccountId(e.target.value)}
                  className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-purple-600 focus:outline-none"
                >
                  <option value="" disabled>
                    Select an account
                  </option>
                  {accounts.map((account) => (
                    <option key={account._id} value={account._id}>
                      {account.bankName} - {account.accountNumber} (
                      {account.accountName})
                      {account.isPrimary ? " · Primary" : ""}
                    </option>
                  ))}
                </select>
                {missingBankCode && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
                    <AlertCircle size={13} />
                    This account has no bank code set, so transfers to it will be
                    rejected. Update it in Settings first.
                  </p>
                )}
              </>
            ) : (
              <div className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                No settlement accounts found. Please add one first.
              </div>
            )}
          </div>

          <button
            onClick={handleWithdraw}
            disabled={
              isCreating ||
              !amountIsValid ||
              !settlementAccountId ||
              exceedsBalance
            }
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 font-bold text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isCreating ? (
              <>
                <Loader className="size-5 animate-spin" />
                Processing...
              </>
            ) : (
              "Withdraw Funds"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
