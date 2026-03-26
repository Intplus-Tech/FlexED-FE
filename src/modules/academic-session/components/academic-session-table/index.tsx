import { GetAcademicSessionResponse, SessionData } from "@/@types/academic-session";
import TableSkeleton from "../../loaders/table-loader";
import { formatDate } from "@/utils/functions";

interface AcademicTableProps {
  periods: GetAcademicSessionResponse;
  isLoading: boolean;
  onEdit?: (period: SessionData) => void;
}

export default function AcademicTable({
  periods,
  isLoading,
  onEdit,
}: AcademicTableProps) {
  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted border-b border-border">
          <tr>
            <th className="px-6 py-4 text-left">
              <input
                type="checkbox"
                className="w-4 h-4 border border-input rounded cursor-pointer"
              />
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
              Period Name
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
              Start Date
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
              End Date
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
              Status
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {periods?.data?.items?.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-6 py-12 text-center text-muted-foreground"
              >
                No academic periods found
              </td>
            </tr>
          ) : (
            periods?.data?.items?.map((period) => (
              <tr
                key={period?.createdAt}
                className="border-b border-border hover:bg-muted/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    className="w-4 h-4 border border-input rounded cursor-pointer"
                  />
                </td>
                <td className="px-6 py-4 text-foreground font-medium">
                  {period.name}
                </td>
                <td className="px-6 py-4 text-foreground whitespace-nowrap">
                  {formatDate(period.startDate)}
                </td>
                <td className="px-6 py-4 text-foreground whitespace-nowrap">
                  {formatDate(period.endDate)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      period.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {period.isActive ? "Active" : "Completed"}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex gap-4">
                    <button
                      onClick={() => onEdit?.(period)}
                      className="text-primary hover:underline text-sm font-medium"
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {/* <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
        <button className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Previous
        </button>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded-md bg-primary text-primary-foreground">
            1
          </button>
          <button className="px-3 py-1 text-foreground hover:bg-muted rounded-md">
            2
          </button>
          <button className="px-3 py-1 text-foreground hover:bg-muted rounded-md">
            3
          </button>
          <span className="text-muted-foreground">...</span>
          <button className="px-3 py-1 text-foreground hover:bg-muted rounded-md">
            67
          </button>
          <button className="px-3 py-1 text-foreground hover:bg-muted rounded-md">
            68
          </button>
        </div>
        <button className="text-sm font-medium text-foreground hover:text-primary">
          Next →
        </button>
      </div> */}
    </div>
  );
}
