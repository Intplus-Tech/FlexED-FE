"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import type { PayoutStatus } from "@/@types/payout";
import { useGetPayoutsQuery } from "@/redux/api/payout";
import { useGetShoolProfileQuery } from "@/redux/api/school";

import { SettlementSummary } from "../components/SettlementSummary";
import { SettlementTable } from "../components/SettlementTable";
import { SettlementDetailModal } from "../components/SettlementDetailModal";
import { WithdrawModal } from "../components/WithdrawModal";

export default function SettlementView() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [status, setStatus] = useState<PayoutStatus | undefined>();
  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const { data: schoolProfile } = useGetShoolProfileQuery();
  const schoolId = schoolProfile?.data?._id || "";

  const { data, isFetching, isLoading, isError, error, refetch } =
    useGetPayoutsQuery({
      page: pageIndex + 1,
      limit: pageSize,
      status,
    });

  const payouts = data?.data ?? [];
  const totalCount = data?.pagination?.total ?? 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-3xl font-bold text-gray-900">Settlements</h1>
          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 font-bold text-white shadow-sm transition-colors hover:bg-purple-700"
          >
            <Plus size={18} />
            Withdraw Funds
          </button>
        </div>

        <SettlementSummary />

        <SettlementTable
          payouts={payouts}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          error={error}
          totalCount={totalCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
          status={status}
          onPageChange={setPageIndex}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPageIndex(0);
          }}
          onStatusChange={(next) => {
            setStatus(next);
            setPageIndex(0);
          }}
          onRefresh={refetch}
          onViewDetails={setSelectedPayoutId}
        />
      </div>

      <SettlementDetailModal
        payoutId={selectedPayoutId}
        onClose={() => setSelectedPayoutId(null)}
      />

      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        schoolId={schoolId}
      />
    </div>
  );
}
