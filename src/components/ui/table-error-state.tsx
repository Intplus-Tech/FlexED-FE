import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TableErrorStateProps {
  /**
   * What went wrong, in the API's own words when it gave any. Shown under the
   * headline — keep the headline generic and let this carry the specifics.
   */
  message?: string;
  /** Wire to the query's refetch. Omitted when the caller has nothing to retry with. */
  onRetry?: () => void;
  className?: string;
}

/**
 * The counterpart to `TableEmptyState`, for when the list could not be loaded
 * at all. Without it a failed request falls through to the empty state, and a
 * broken endpoint is indistinguishable from a genuinely empty table.
 */
export function TableErrorState({
  message,
  onRetry,
  className,
}: TableErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-5 px-8 py-14",
        className
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
        <AlertCircle className="size-6" />
      </span>
      <div className="max-w-80 space-y-1.5 text-center">
        <p className="text-sm font-semibold text-gray-900">
          Couldn&apos;t load this list
        </p>
        <p className="text-sm leading-relaxed text-gray-500">
          {message || "Something went wrong on our end. Try again in a moment."}
        </p>
      </div>
      {onRetry && (
        <Button variant="secondary-gray" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
