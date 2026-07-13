import { LogoLoader } from "@/components/ui/logo-loader";

export function TableSkeleton() {
  return (
    <tr>
      <td colSpan={8} className="px-6 py-12">
        <div className="flex justify-center">
          <LogoLoader size={56} />
        </div>
      </td>
    </tr>
  );
}
