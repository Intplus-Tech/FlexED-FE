import { FeeMetricsProps } from "../../@types";

export function FeeMetrics({
  feesThisTerm,
  feesCollected,
  totalOutstanding,
  percentageOutstanding,
}: FeeMetricsProps) {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl p-8 text-white">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="border-r border-purple-400/30 pr-8 last:border-r-0 last:pr-0">
          <h3 className="text-sm font-medium text-purple-100 mb-3">
            Total Fees Collected This Term
          </h3>
          <p className="text-4xl font-bold">{feesThisTerm}</p>
        </div>

        <div className="border-r border-purple-400/30 pr-8 last:border-r-0 last:pr-0">
          <h3 className="text-sm font-medium text-purple-100 mb-3">
            Total Fees Collected
          </h3>
          <p className="text-4xl font-bold">{feesCollected}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-purple-100 mb-3">
            Total Outstanding
          </h3>
          <p className="text-4xl font-bold mb-2">{totalOutstanding}</p>
          <p className="text-lg font-semibold text-purple-100">
            Percentage Outstanding
          </p>
          <p className="text-2xl font-bold">{percentageOutstanding}</p>
        </div>
      </div>
    </div>
  );
}
