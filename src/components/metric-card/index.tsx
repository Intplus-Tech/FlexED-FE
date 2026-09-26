interface MetricCardProps {
  title: string;
  studentCount: number;
  /** Formatted, e.g. "₦180,000". */
  collected: string;
  /**
   * Formatted, e.g. "₦70,000". Omit to hide the line entirely — used for a
   * category (Fully Paid) where it is always zero and saying so adds nothing.
   */
  outstanding?: string;
  onClick?: () => void;
}

export function MetricCard({
  title,
  studentCount,
  collected,
  outstanding,
  onClick,
}: MetricCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm text-gray-600 font-medium">{title}</h3>

        <button
          onClick={onClick}
          className="px-4 py-2 text-sm text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
        >
          View List
        </button>
      </div>

      <div className="mb-4">
        <p className="text-3xl font-bold text-gray-900">
          {studentCount}
          <span className="text-base font-medium text-gray-500 ml-1.5">
            {studentCount === 1 ? "Student" : "Students"}
          </span>
        </p>
      </div>

      <div className="space-y-1 text-sm">
        <p className="text-gray-500">
          Collected{" "}
          <span className="font-medium text-gray-700">{collected}</span>
        </p>
        {outstanding && (
          <p className="text-gray-500">
            Outstanding{" "}
            <span className="font-medium text-gray-700">{outstanding}</span>
          </p>
        )}
      </div>
    </div>
  );
}
