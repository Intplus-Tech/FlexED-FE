interface StudentMetricCardProps {
  title: string;
  value: string;
  valueColor?: "green" | "red" | "gray";
}

export function StudentMetricCard({
  title,
  value,
  valueColor = "green",
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
      </div>

      <div className="mb-3">
        <p className={`text-4xl font-bold ${colorClasses[valueColor]}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
