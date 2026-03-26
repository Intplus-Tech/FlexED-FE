const SKELETON_ROWS = 5;

export function TableSkeleton() {
  return (
    <>
      {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
        <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
          <td className="px-6 py-4">
            <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
          </td>
          {/* <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
          </td> */}
        </tr>
      ))}
    </>
  );
}
