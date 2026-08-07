/**
 * A PAID transaction no longer guarantees the underlying fee item is fully
 * settled (an underpaid bank transfer, or a partial wallet redemption, can
 * both be PAID with closesPaymentItem: false). closesPaymentItem may be
 * absent on older records — treat undefined as "assume settled" so existing
 * behavior doesn't regress.
 */
export function getPaymentStatusBadge(
  status: string,
  closesPaymentItem?: boolean,
): { label: string; className: string } {
  if (status === "PAID") {
    if (closesPaymentItem === false) {
      return { label: "Partially Settled", className: "text-amber-700 bg-amber-50" };
    }
    return { label: "PAID", className: "text-green-700 bg-green-50" };
  }
  if (status === "PENDING") {
    return { label: "PENDING", className: "text-yellow-600 bg-yellow-50" };
  }
  return { label: status, className: "text-red-700 bg-red-50" };
}
