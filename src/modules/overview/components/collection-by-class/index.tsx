import { CollectionByClassProps } from "../../@types";

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
        {data?.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
          >
            <span className="text-gray-700 font-medium">{item.className}</span>
            <div className="text-right">
              <p className="text-gray-900 font-semibold">
                {item.percentage} ({item.collected}/{item.total})
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
