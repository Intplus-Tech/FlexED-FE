import { FeeMetricsProps } from "../../@types";

export function FeeMetrics({
  feesThisTerm,
  feesCollected,
  totalOutstanding,
  percentageOutstanding,
}: FeeMetricsProps) {
  return (
    <div className="bg-[linear-gradient(134.13deg,#8147E7_3.11%,#5C00FF_99.09%)] rounded-2xl p-4 text-white">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border-r border-purple-400/30 pr-8 last:border-r-0 last:pr-0">
          <h3 className="text-sm font-medium text-purple-100 mb-3">
            Total Fees Expected for This Term
          </h3>
          <p className="text-2xl font-bold">{feesThisTerm}</p>
        </div>

        <div className="border-r border-purple-400/30 pr-8 last:border-r-0 last:pr-0">
          <h3 className="text-sm font-medium text-purple-100 mb-3">
            Total Fees Collected this term
          </h3>
          <p className="text-2xl font-bold">{feesCollected}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-purple-100 mb-3">
            Total Outstanding for this Term
          </h3>
          <p className="text-2xl font-bold mb-2">{totalOutstanding}</p>
          <p className="text-lg font-semibold text-purple-100">
            Percentage Outstanding
          </p>
          <p className="text-2xl font-bold">{percentageOutstanding}</p>
        </div>
      </div>
    </div>
  );
}
