import { Wallet, ArrowUpRight } from "lucide-react";
import { useGetSchoolWalletQuery } from "@/redux/api/payout";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export function SettlementSummary() {
  const { data: wallet, isLoading, isFetching } = useGetSchoolWalletQuery();

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700">
            <CheckCircle2 size={12} />
            Successful
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700">
            <XCircle size={12} />
            Failed
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-700">
            <Clock size={12} />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  if (isLoading || isFetching) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
        <div className="h-36 bg-gray-200 rounded-2xl" />
        <div className="h-36 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  const lastSettlement = wallet?.lastSettlement;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Wallet Balance Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Wallet size={16} className="text-gray-400" />
          <p className="text-sm font-medium text-gray-500">Total Settled</p>
        </div>
        <div>
          <p className="text-3xl font-bold tracking-tight text-gray-900">
            ₦{(wallet?.balance || 0).toLocaleString("en-NG", {
              minimumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-gray-500 mt-1">Available for settlement</p>
        </div>
      </div>

      {/* Last Settlement Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <ArrowUpRight size={16} className="text-gray-400" />
          <p className="text-sm font-medium text-gray-500">Last Settlement</p>
        </div>
        {lastSettlement ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Amount:</span>
              <span className="text-sm font-bold text-gray-900">
                ₦{lastSettlement.amount.toLocaleString("en-NG", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Date:</span>
              <span className="text-sm font-medium text-gray-900">
                {formatFullDate(lastSettlement.createdAt)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Status:</span>
              {getStatusBadge(lastSettlement.status)}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 mt-2">No settlements yet</p>
        )}
      </div>
    </div>
  );
}
