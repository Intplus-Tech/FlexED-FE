import { LogoLoader } from "@/components/ui/logo-loader";

export default function TableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted border-b border-border">
          <tr>
            <th className="px-6 py-4 text-left">
              <div className="w-4 h-4 bg-muted-foreground/20 rounded"></div>
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
              Students
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={7} className="px-6 py-12">
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
