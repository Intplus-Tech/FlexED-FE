import { Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNaira } from "@/utils/functions";

interface ParentWalletBadgeProps {
  parentName: string;
  relationship?: string;
  balance: number;
  isLoading: boolean;
}

export function ParentWalletBadge({
  parentName,
  relationship,
  balance,
  isLoading,
}: ParentWalletBadgeProps) {
  const hasCredit = !isLoading && balance > 0;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border text-sm",
        hasCredit
          ? "bg-purple-50 border-purple-100"
          : "bg-gray-50 border-gray-200",
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
            hasCredit ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-400",
          )}
        >
          <Wallet size={14} />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-gray-800 truncate">
            {parentName}
            {relationship && (
              <span className="text-gray-400 font-normal">
                {" "}
                ({relationship.toLowerCase()})
              </span>
            )}
          </p>
          {hasCredit && (
            <p className="text-xs text-purple-600">
              Already has wallet credit — they can spend it themselves at any
              time.
            </p>
          )}
        </div>
      </div>
      <span
        className={cn(
          "font-bold shrink-0",
          isLoading
            ? "text-gray-300"
            : hasCredit
              ? "text-purple-700"
              : "text-gray-400",
        )}
      >
        {isLoading ? "..." : formatNaira(balance)}
      </span>
    </div>
  );
}
