import { LogoLoader } from "@/components/ui/logo-loader";

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
          <tr>
            <td colSpan={8} className="px-6 py-12">
              <div className="flex justify-center">
                <LogoLoader size={56} />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
