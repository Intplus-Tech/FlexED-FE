import Link from "next/link";

interface StudentMetricCardProps {
  title: string;
  value: string;
  change: string;
  changeLabel: string;
  valueColor?: "green" | "red" | "gray";
  viewListHref?: string;
}

export function StudentMetricCard({
  title,
  value,
  change,
  changeLabel,
  valueColor = "green",
  viewListHref,
}: StudentMetricCardProps) {
  const colorClasses = {
    green: "text-green-600",
    red: "text-red-500",
    gray: "text-gray-700",
  };

  return (
    <div className="border border-gray-200 rounded-xl p-6 bg-white">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm text-gray-600 font-medium">{title}</h3>
        {viewListHref && (
          <Link
            href={viewListHref}
            className="px-4 py-2 text-sm text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
          >
            View List
          </Link>
        )}
      </div>

      <div className="mb-3">
        <p className={`text-4xl font-bold ${colorClasses[valueColor]}`}>
          {value}
        </p>
      </div>

      <div className="text-sm">
        <span className="text-green-600 font-medium">{change}</span>
        <span className="text-gray-500 ml-1">{changeLabel}</span>
      </div>
    </div>
  );
}
