import { StudentTransactionGroup } from "@/@types/transaction";

/** The fee item a transaction was paid against, however the API populated it. */
function paymentItemName(payment: { paymentItem?: unknown }): string {
  const item = payment.paymentItem;
  if (item && typeof item === "object") {
    return (item as { name?: string }).name?.trim() || "";
  }
  return typeof item === "string" ? item : "";
}

export type ExportRow = Record<string, string | number>;

/**
 * Builds the fee register exported from the payments page: one row per student,
 * with a column per fee item (Tuition, PTA, and whatever else the school bills)
 * holding what that student has paid toward it, then a TOTAL row.
 *
 * Fee columns are derived from the items that actually appear in the data, so a
 * school that bills a "B/F" item gets a B/F column and one that doesn't, doesn't.
 *
 * Only PAID transactions count, matching how the API computes `amountPaid` — a
 * pending or failed attempt is not money received. Balance Owing is signed:
 * negative means the student overpaid.
 */
export function buildFeeRegister(
  groups: StudentTransactionGroup[],
  resolveClass: (group: StudentTransactionGroup) => string
): ExportRow[] {
  if (groups.length === 0) return [];

  const paidPerStudent = groups.map((group) => {
    const perItem = new Map<string, number>();
    (group.payments ?? []).forEach((payment) => {
      if (payment.status !== "PAID") return;
      const name = paymentItemName(payment);
      if (!name) return;
      perItem.set(name, (perItem.get(name) ?? 0) + (payment.amount ?? 0));
    });
    return perItem;
  });

  const feeColumns = [
    ...new Set(paidPerStudent.flatMap((perItem) => [...perItem.keys()])),
  ].sort((a, b) => a.localeCompare(b));

  const rows: ExportRow[] = groups.map((group, index) => {
    const totalBill = group.totalBilled ?? group.totalOwed ?? 0;
    const amountPaid = group.totalAmountPaid ?? group.totalPaid ?? 0;
    const perItem = paidPerStudent[index];

    // Every row carries every fee column, zero-filled — a sparse row would
    // shift the spreadsheet's columns out of alignment.
    const feeCells: ExportRow = {};
    feeColumns.forEach((name) => {
      feeCells[name.toUpperCase()] = perItem.get(name) ?? 0;
    });

    return {
      " ": index + 1,
      "STUDENT NAMES": `${group.student?.firstName ?? ""} ${
        group.student?.lastName ?? ""
      }`.trim(),
      CLASS: resolveClass(group),
      ...feeCells,
      "TOTAL BILL": totalBill,
      "AMOUNT PAID": amountPaid,
      "BALANCE OWING": totalBill - amountPaid,
    };
  });

  const numericColumns = [
    ...feeColumns.map((name) => name.toUpperCase()),
    "TOTAL BILL",
    "AMOUNT PAID",
    "BALANCE OWING",
  ];

  const totalRow: ExportRow = {
    " ": "",
    "STUDENT NAMES": "TOTAL",
    CLASS: "",
  };
  numericColumns.forEach((column) => {
    totalRow[column] = rows.reduce(
      (total, row) => total + (Number(row[column]) || 0),
      0
    );
  });

  return [...rows, totalRow];
}
