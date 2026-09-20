"use client";

import { useState } from "react";
import { Check, CheckCircle2, Clock, Copy, RotateCcw, XCircle } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LogoLoader } from "@/components/ui/logo-loader";
import { useGetPayoutByIdQuery } from "@/redux/api/payout";
import { normalizeError } from "@/lib/api-error";
import { formatKobo } from "@/utils/functions";

import { initiatorLabel, settlementAccountLabel } from "./settlement-columns";

interface SettlementDetailModalProps {
  payoutId: string | null;
  onClose: () => void;
}

/** Banner treatment per status — mirrors the badge, at page-header scale. */
const BANNER = {
  SUCCESS: {
    className: "bg-green-50 border-green-100",
    icon: <CheckCircle2 size={24} className="text-green-600" />,
    title: "Payout Successful",
  },
  PROCESSING: {
    className: "bg-blue-50 border-blue-100",
    icon: <Clock size={24} className="text-blue-600" />,
    title: "Payout Processing",
  },
  PENDING: {
    className: "bg-amber-50 border-amber-100",
    icon: <Clock size={24} className="text-amber-600" />,
    title: "Payout Pending",
  },
  FAILED: {
    className: "bg-red-50 border-red-100",
    icon: <XCircle size={24} className="text-red-600" />,
    title: "Payout Failed",
  },
  REVERSED: {
    className: "bg-gray-50 border-gray-200",
    icon: <RotateCcw size={24} className="text-gray-600" />,
    title: "Payout Reversed",
  },
} as const;

export function SettlementDetailModal({
  payoutId,
  onClose,
}: SettlementDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const {
    data: selectedPayout,
    isFetching,
    isError,
    error,
  } = useGetPayoutByIdQuery(payoutId as string, { skip: !payoutId });

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatFullDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const banner = selectedPayout
    ? BANNER[selectedPayout.status] ?? BANNER.PENDING
    : null;

  return (
    <Dialog open={!!payoutId} onOpenChange={() => onClose()}>
      <DialogContent className="w-full max-w-lg!">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4">
          <DialogTitle className="text-lg font-bold text-gray-900">
            Payout Details
          </DialogTitle>
          <DialogClose className="cursor-pointer text-gray-400 transition-colors hover:text-gray-600" />
        </DialogHeader>

        {isFetching ? (
          <div className="flex flex-col items-center justify-center py-12">
            <LogoLoader size={56} />
            <span className="mt-3 text-sm font-semibold text-gray-500">
              Loading payout details...
            </span>
          </div>
        ) : isError ? (
          <div role="alert" className="py-10 text-center">
            <p className="text-sm font-semibold text-gray-900">
              Couldn&apos;t load this payout
            </p>
            <p className="mt-1.5 text-sm text-gray-500">
              {normalizeError(error).message ||
                "Something went wrong. Try again in a moment."}
            </p>
          </div>
        ) : selectedPayout && banner ? (
          <div className="space-y-5 pt-2">
            <div
              className={`flex items-center gap-3 rounded-xl border p-4 ${banner.className}`}
            >
              {banner.icon}
              <div>
                <p className="text-sm font-bold">{banner.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {formatFullDate(selectedPayout.createdAt)}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 text-center">
              <p className="mb-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                Settlement Amount
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {formatKobo(selectedPayout.amount)}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Fee: {formatKobo(selectedPayout.feeAmount)}
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  label: "Provider Reference",
                  value: selectedPayout.providerReference ?? "—",
                  copyable: true,
                  key: "provRef",
                },
                {
                  label: "NIP Reference",
                  value: selectedPayout.providerNipReference ?? "—",
                  copyable: !!selectedPayout.providerNipReference,
                  key: "nipRef",
                },
                {
                  label: "Settlement Account",
                  value: settlementAccountLabel(selectedPayout),
                  copyable: false,
                  key: "account",
                },
                {
                  label: "Initiated By",
                  value: initiatorLabel(selectedPayout),
                  copyable: false,
                  key: "initiatedBy",
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
                  className="flex items-center justify-between border-b border-gray-50 py-2.5 last:border-0"
                >
                  <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="max-w-[200px] truncate font-mono text-sm font-medium text-gray-900">
                      {item.value}
                    </span>
                    {item.copyable && (
                      <button
                        onClick={() => handleCopy(item.value, item.key)}
                        className="cursor-pointer rounded p-1 transition-colors hover:bg-gray-100"
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
