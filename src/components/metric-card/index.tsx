import Link from "next/link";

interface MetricCardProps {
  title: string;
  amount: string;
  amountColor?: "green" | "red" | "gray";
  studentCount: number;
  viewListHref?: string;
  onClick?: () => void;
}

export function MetricCard({
  title,
  amount,
  amountColor = "gray",
  studentCount,
  viewListHref,
  onClick,
}: MetricCardProps) {
  const colorClasses = {
    green: "text-green-600",
    red: "text-red-500",
    gray: "text-gray-400",
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm text-gray-600 font-medium">{title}</h3>
        {viewListHref && (
          <button
            onClick={onClick}
            className="px-4 py-2 text-sm text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
          >
            View List
          </button>
        )}
      </div>

      <div className="mb-4">
        <p className={`text-3xl font-bold ${colorClasses[amountColor]}`}>
          {amount}
        </p>
      </div>

      <div className="text-sm text-gray-500">
        <span>{studentCount}</span>
        <span className="ml-1">Students</span>
      </div>
    </div>
  );
}
