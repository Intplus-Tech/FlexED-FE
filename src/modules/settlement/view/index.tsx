"use client";

import { useState } from "react";
import { useGetPayoutsQuery } from "@/redux/api/payout";
import { useGetShoolProfileQuery } from "@/redux/api/school";
import { SettlementSummary } from "../components/SettlementSummary";
import { SettlementTable } from "../components/SettlementTable";
import { SettlementDetailModal } from "../components/SettlementDetailModal";
import { WithdrawModal } from "../components/WithdrawModal";
import { Plus } from "lucide-react";

const ITEMS_PER_PAGE = 20;

export default function SettlementView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const { data: schoolProfile } = useGetShoolProfileQuery();
  const schoolId = schoolProfile?.data?._id || "";

  const { data, isFetching, isLoading } = useGetPayoutsQuery({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: searchQuery,
  });

  const payouts = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Settlements</h1>
          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-sm"
          >
            <Plus size={18} />
            Withdraw Funds
          </button>
        </div>

        {/* Summary Cards */}
        <SettlementSummary />

        {/* Payouts Table */}
        <SettlementTable
          payouts={payouts}
          isLoading={isLoading}
          isFetching={isFetching}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onSearch={handleSearch}
          onViewDetails={setSelectedPayoutId}
        />
      </div>

      {/* Payout Detail Modal */}
      <SettlementDetailModal
        payoutId={selectedPayoutId}
        onClose={() => setSelectedPayoutId(null)}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        schoolId={schoolId}
      />
    </div>
  );
}
