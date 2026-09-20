/* eslint-disable @typescript-eslint/no-empty-object-type */
export function QueryHelper<T extends {}>(url: string, query: T) {
  return `${url}?${queryToString(query)}`;
}

function queryToString<T extends {}>(query: T): string {
  return Object.entries(query)
    .filter(([_, value]) => Boolean(value))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

export const formatNaira = (amount: number | string): string => {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(value)) return "₦0";

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(value);
};

/**
 * The wallet, payout and wallet-ledger endpoints return amounts in kobo, while
 * the fee and transaction endpoints return plain Naira. These two convert at
 * that boundary — never render a wallet amount without `koboToNaira`, and never
 * submit a typed Naira amount to `/payouts` without `nairaToKobo`.
 */
export const koboToNaira = (kobo: number): number => (kobo ?? 0) / 100;

export const nairaToKobo = (naira: number): number => Math.round(naira * 100);

/** Formats a kobo amount as Naira, e.g. 250000 -> "₦2,500.00". */
export const formatKobo = (kobo: number): string =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(koboToNaira(kobo));

import dayjs from "dayjs";

/**
 * Converts an ISO date string to a formatted date
 * @param isoDate - ISO date string (e.g., "2025-12-02T00:00:00.000Z")
 * @param format - Optional format string (default: "DD MMMM YYYY")
 * @returns Formatted date string
 */
export const formatDate = (
  isoDate: string,
  format: string = "DD MMMM YYYY"
): string => {
  return dayjs(isoDate).format(format);
};

export const toISOStringSafe = (date?: string | Date): string => {
  if (!date) return "";

  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return "";

  return parsed.toISOString();
};
