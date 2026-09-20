"use client";

import { AlertCircle, ArrowUpRight, Wallet } from "lucide-react";

import { useGetSchoolWalletQuery } from "@/redux/api/payout";
import { normalizeError } from "@/lib/api-error";
import { formatKobo } from "@/utils/functions";

import { PayoutStatusBadge } from "./PayoutStatusBadge";

export function SettlementSummary() {
  const {
    data: wallet,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetSchoolWalletQuery();

  const formatFullDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  if (isLoading) {
    return (
      <div className="grid animate-pulse grid-cols-1 gap-6 md:grid-cols-2">
        <div className="h-36 rounded-2xl bg-gray-200" />
        <div className="h-36 rounded-2xl bg-gray-200" />
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-6"
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="size-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Couldn&apos;t load your wallet
            </p>
            <p className="text-sm text-gray-600">
              {normalizeError(error).message ||
                "Your balance is temporarily unavailable."}
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="shrink-0 cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          Try again
        </button>
      </div>
    );
  }

  const lastSettlement = wallet?.lastSettlement;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Wallet size={16} className="text-gray-400" />
          <p className="text-sm font-medium text-gray-500">Wallet Balance</p>
        </div>
        <div>
          <p className="text-3xl font-bold tracking-tight text-gray-900">
            {formatKobo(wallet?.balance ?? 0)}
          </p>
          <p className="mt-1 text-xs text-gray-500">Available for withdrawal</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <ArrowUpRight size={16} className="text-gray-400" />
          <p className="text-sm font-medium text-gray-500">Last Settlement</p>
        </div>
        {lastSettlement ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Amount:</span>
              <span className="text-sm font-bold text-gray-900">
                {formatKobo(lastSettlement.amount)}
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
              <PayoutStatusBadge status={lastSettlement.status} />
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-400">No settlements yet</p>
        )}
      </div>
    </div>
  );
}
