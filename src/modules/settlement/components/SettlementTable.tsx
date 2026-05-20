import { SearchInput } from "@/components/search-input";
import { ExportButton } from "@/components/export-button";
import { Pagination } from "@/components/pagination";
import { AlertCircle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useMemo } from "react";
import { Payout } from "@/@types/payout";

interface SettlementTableProps {
  payouts: Payout[];
  isLoading: boolean;
  isFetching: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSearch: (query: string) => void;
  onViewDetails: (id: string) => void;
}

export function SettlementTable({
  payouts,
  isLoading,
  isFetching,
  currentPage,
  totalPages,
  onPageChange,
  onSearch,
  onViewDetails,
}: SettlementTableProps) {
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

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    if (diffHours < 48) {
      return "Yesterday";
    }
    return d.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const exportData = useMemo(() => {
    return payouts.map((p) => ({
      Date: new Date(p.createdAt).toLocaleDateString(),
      "Transaction ID": p.providerReference,
      Amount: p.amount,
      Fee: p.feeAmount,
      Status: p.status,
      "Provider Reference": p.providerNipReference,
    }));
  }, [payouts]);

  return (
    <>
      {/* Search + Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <SearchInput onSearch={onSearch} placeholder="Search settlements..." />
        <ExportButton
          data={exportData}
          filename="Settlements_Payouts"
          sheetName="Payouts"
        />
      </div>

      {/* Payouts Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Time / Date
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Fee
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading || isFetching ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="h-4 w-20 bg-gray-200 rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-28 bg-gray-200 rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-16 bg-gray-200 rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 w-24 bg-gray-200 rounded-full" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-12 bg-gray-200 rounded" />
                  </td>
                </tr>
              ))
            ) : payouts.length > 0 ? (
              payouts.map((payout) => (
                <tr
                  key={payout._id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                    {formatDate(payout.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-gray-600">
                      {payout.providerReference?.slice(0, 16) ||
                        payout._id.slice(0, 12)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    ₦{payout.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    ₦{payout.feeAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(payout.status)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onViewDetails(payout._id)}
                      className="text-sm text-purple-600 hover:text-purple-800 font-semibold transition-colors cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                      <AlertCircle size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">
                      No settlements found
                    </p>
                    <p className="text-sm text-gray-400">
                      Settlements will appear here once payouts are processed.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}
