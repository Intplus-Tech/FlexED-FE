import { CollectionByClassProps } from "../../@types";
import { formatNaira } from "@/utils/functions";

/** Clamped so a class that overpaid doesn't render a bar past 100%. */
function barWidth(percent: number) {
  return `${Math.min(Math.max(percent, 0), 100)}%`;
}

function percentLabel(percent: number) {
  if (!Number.isFinite(percent)) return "0%";
  // Whole numbers read cleaner on a dashboard; only show a decimal when the
  // figure would otherwise round away to a misleading 0% or 100%.
  const rounded = Math.round(percent);
  if (rounded === 0 && percent > 0) return `${percent.toFixed(1)}%`;
  if (rounded === 100 && percent < 100) return `${percent.toFixed(1)}%`;
  return `${rounded}%`;
}

export function CollectionByClass({
  totalStudents,
  data,
}: CollectionByClassProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 col-span-1">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Collection by Class
        </h3>
        <p className="text-sm text-gray-600">Total Students: {totalStudents}</p>
      </div>

      <div className="space-y-4">
        {data?.length ? (
          data.map((item) => {
            const percent = Number(item.percentPaid) || 0;
            return (
              <div
                key={item.classId ?? item.className}
                className="py-3 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-700 font-medium">
                    {item.className}
                  </span>
                  <span className="text-gray-900 font-semibold tabular-nums">
                    {percentLabel(percent)}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-1.5 flex-1 rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-purple-600 transition-[width] duration-500"
                      style={{ width: barWidth(percent) }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 tabular-nums shrink-0">
                    {formatNaira(item.paidAmount ?? 0)} /{" "}
                    {formatNaira(item.expectedAmount ?? 0)}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-400 py-6 text-center">
            No collections for this period yet.
          </p>
        )}
      </div>
    </div>
  );
}
