export function TableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full ">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-4 text-left">
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
              Class Name
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
              Level
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
              Class Type
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
              Sub Class
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
              Students
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
              Status
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {[...Array(6)].map((_, i) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="px-6 py-4">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-200 rounded w-10"></div>
                  <div className="h-4 bg-gray-200 rounded w-14"></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
