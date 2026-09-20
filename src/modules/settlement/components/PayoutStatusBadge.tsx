import { CheckCircle2, Clock, Loader, RotateCcw, XCircle } from "lucide-react";

import type { PayoutStatus } from "@/@types/payout";
import { cn } from "@/lib/utils";

/**
 * Presentation for every payout status the API can return.
 *
 * PROCESSING and REVERSED are as real as the other three: the provider returns
 * PROCESSING for a timed-out or ambiguous transfer that is still being
 * re-queried, and REVERSED when a definitive failure sent the money back to the
 * wallet. Rendering those as an unstyled fallback left a school unsure whether
 * their money had moved.
 */
const CONFIG: Record<
  PayoutStatus,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  SUCCESS: {
    label: "Successful",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-700",
  },
  PROCESSING: {
    label: "Processing",
    icon: Loader,
    className: "bg-blue-100 text-blue-700",
  },
  PENDING: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-100 text-amber-700",
  },
  FAILED: {
    label: "Failed",
    icon: XCircle,
    className: "bg-red-100 text-red-700",
  },
  REVERSED: {
    label: "Reversed",
    icon: RotateCcw,
    className: "bg-gray-100 text-gray-700",
  },
};

export function PayoutStatusBadge({ status }: { status: PayoutStatus | string }) {
  const config = CONFIG[status as PayoutStatus];

  if (!config) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
        {status}
      </span>
    );
  }

  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
        config.className
      )}
    >
      <Icon size={12} className={cn(status === "PROCESSING" && "animate-spin")} />
      {config.label}
    </span>
  );
}

export const PAYOUT_STATUS_LABEL: Record<PayoutStatus, string> = {
  SUCCESS: "Successful",
  PROCESSING: "Processing",
  PENDING: "Pending",
  FAILED: "Failed",
  REVERSED: "Reversed",
};
