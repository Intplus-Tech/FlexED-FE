import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useState } from "react";
import {
  useGetSettlementAccountsQuery,
  useCreatePayoutMutation,
} from "@/redux/api/payout";
import { Loader } from "lucide-react";
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
  const [settlementAccountId, setSettlementAccountId] = useState("");

  const { data: accounts, isFetching: isLoadingAccounts } =
    useGetSettlementAccountsQuery(schoolId, { skip: !isOpen || !schoolId });

  const [createPayout, { isLoading: isCreating }] = useCreatePayoutMutation();

  const handleWithdraw = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      showerror("Please enter a valid amount");
      return;
    }
    if (!settlementAccountId) {
      showerror("Please select a settlement account");
      return;
    }

    try {
      await createPayout({
        amount: Number(amount),
        settlementAccountId,
      }).unwrap();
      
      showsuccess("Withdrawal initiated successfully");
      setAmount("");
      setSettlementAccountId("");
      onClose();
    } catch (error: any) {
      showerror(error?.data?.message || "Failed to initiate withdrawal");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4">
          <DialogTitle className="text-lg font-bold text-gray-900">
            Withdraw Funds
          </DialogTitle>
          <DialogClose className="text-gray-400 hover:text-gray-600 transition-colors" />
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                ₦
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Account Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Settlement Account
            </label>
            {isLoadingAccounts ? (
              <div className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-gray-400">
                <span>Loading accounts...</span>
                <Loader className="w-4 h-4 animate-spin" />
              </div>
            ) : accounts && accounts.length > 0 ? (
              <select
                value={settlementAccountId}
                onChange={(e) => setSettlementAccountId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all appearance-none"
              >
                <option value="" disabled>Select an account</option>
                {accounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.bankName} - {account.accountNumber} ({account.accountName})
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full py-3 px-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
                No settlement accounts found. Please add one first.
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleWithdraw}
            disabled={isCreating || !amount || !settlementAccountId}
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isCreating ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
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
