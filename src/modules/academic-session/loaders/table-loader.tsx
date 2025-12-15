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
          {[...Array(10)].map((_, i) => (
            <tr key={i} className="border-b border-border">
              <td className="px-6 py-4">
                <div className="w-4 h-4 bg-muted-foreground/20 rounded animate-pulse"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-muted-foreground/20 rounded w-32 animate-pulse"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-muted-foreground/20 rounded w-24 animate-pulse"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-muted-foreground/20 rounded w-24 animate-pulse"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-muted-foreground/20 rounded w-20 animate-pulse"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-muted-foreground/20 rounded w-16 animate-pulse"></div>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-4">
                  <div className="h-4 bg-muted-foreground/20 rounded w-12 animate-pulse"></div>
                  <div className="h-4 bg-muted-foreground/20 rounded w-12 animate-pulse"></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
