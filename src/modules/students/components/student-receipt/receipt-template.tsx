import { forwardRef } from "react";
import { StudentFeeProfile } from "@/@types/transaction";
import { SchoolProfile } from "@/@types/school";
import { formatNaira, formatDate } from "@/utils/functions";
import { DocumentHeader } from "./document-header";

interface ReceiptTemplateProps {
  school?: SchoolProfile;
  feeProfile: StudentFeeProfile;
  paidDatesByItemId: Record<string, string | undefined>;
  generatedAt: string;
  receiptNumber: string;
  /** Active academic period(s), e.g. "2nd Term · 2025/2026 Session" */
  termLabel?: string;
}

const numeric: React.CSSProperties = { fontVariantNumeric: "tabular-nums" };
const cellBorder = "border border-gray-300";

export const ReceiptTemplate = forwardRef<HTMLDivElement, ReceiptTemplateProps>(
  ({ school, feeProfile, paidDatesByItemId, generatedAt, receiptNumber, termLabel }, ref) => {
    const items = feeProfile.paymentItem ?? [];
    const paidItems = items.filter((item) => item.status === "COMPLETED");
    const outstandingItems = items.filter((item) => item.status !== "COMPLETED");

    const totalPaid = items.reduce((sum, item) => sum + item.amountPaidPreviously, 0);
    const totalOutstanding = feeProfile.totalExpectedBalance ?? 0;
    const isFullyPaid = totalOutstanding <= 0;

    return (
      <div
        ref={ref}
        className="bg-white text-gray-900"
        style={{ width: "794px", fontFamily: "Arial, Helvetica, sans-serif" }}
      >
        <DocumentHeader
          school={school}
          title="RECEIPT"
          documentNumber={receiptNumber}
          documentNumberLabel="Receipt No"
          generatedAt={generatedAt}
        />

        <div className="px-14 py-10">
          {/* Title */}
          <div className="text-center border-b-2 border-gray-800 pb-3 mb-6">
            {termLabel && (
              <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest mb-1">
                {termLabel}
              </p>
            )}
            <p className="text-base font-bold text-gray-900 uppercase tracking-wide">
              Fee Receipt — {feeProfile.name} ({feeProfile.class?.name})
            </p>
          </div>

          {/* Student info */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-600">
              Admission No: <span className="font-semibold text-gray-800">{feeProfile.admissionNumber}</span>
            </p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                isFullyPaid ? "bg-green-100 text-green-700" : "bg-rose-100 text-rose-700"
              }`}
            >
              {isFullyPaid ? "Fully Paid" : "Balance Outstanding"}
            </span>
          </div>

          {/* Paid items */}
          <table className="w-full border-collapse mb-8">
            <thead>
              <tr className="bg-sky-100">
                <th className={`${cellBorder} w-12 text-center text-xs font-bold text-gray-700 uppercase py-2`}>
                  S/N
                </th>
                <th className={`${cellBorder} text-left text-xs font-bold text-gray-700 uppercase py-2 px-3`}>
                  Paid Items
                </th>
                <th className={`${cellBorder} text-right text-xs font-bold text-gray-700 uppercase py-2 px-3`}>
                  Amount Paid
                </th>
                <th className={`${cellBorder} text-right text-xs font-bold text-gray-700 uppercase py-2 px-3`}>
                  Date Paid
                </th>
              </tr>
            </thead>
            <tbody>
              {paidItems.length > 0 ? (
                paidItems.map((item, idx) => (
                  <tr key={item.paymentItemId}>
                    <td className={`${cellBorder} text-center text-sm text-gray-600 py-2`}>
                      {idx + 1}
                    </td>
                    <td className={`${cellBorder} text-sm text-gray-800 py-2 px-3`}>{item.name}</td>
                    <td
                      className={`${cellBorder} text-sm text-right text-gray-800 py-2 px-3`}
                      style={numeric}
                    >
                      {formatNaira(item.amountPaidPreviously)}
                    </td>
                    <td className={`${cellBorder} text-sm text-right text-gray-600 py-2 px-3`}>
                      {paidDatesByItemId[item.paymentItemId]
                        ? formatDate(paidDatesByItemId[item.paymentItemId] as string)
                        : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className={`${cellBorder} text-center text-sm text-gray-400 italic py-4`}>
                    No fee items have been paid yet.
                  </td>
                </tr>
              )}
              <tr className="bg-sky-50">
                <td className={cellBorder} />
                <td className={`${cellBorder} text-sm font-bold text-gray-900 py-2 px-3`}>
                  TOTAL PAID
                </td>
                <td
                  className={`${cellBorder} text-sm font-bold text-right text-gray-900 py-2 px-3`}
                  style={numeric}
                >
                  {formatNaira(totalPaid)}
                </td>
                <td className={cellBorder} />
              </tr>
            </tbody>
          </table>

          {/* Outstanding items */}
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-sky-100">
                <th className={`${cellBorder} w-12 text-center text-xs font-bold text-gray-700 uppercase py-2`}>
                  S/N
                </th>
                <th className={`${cellBorder} text-left text-xs font-bold text-gray-700 uppercase py-2 px-3`}>
                  Outstanding Items
                </th>
                <th className={`${cellBorder} text-right text-xs font-bold text-gray-700 uppercase py-2 px-3`}>
                  Total Fee
                </th>
                <th className={`${cellBorder} text-right text-xs font-bold text-gray-700 uppercase py-2 px-3`}>
                  Balance
                </th>
                <th className={`${cellBorder} text-right text-xs font-bold text-gray-700 uppercase py-2 px-3`}>
                  Due Date
                </th>
              </tr>
            </thead>
            <tbody>
              {outstandingItems.length > 0 ? (
                outstandingItems.map((item, idx) => (
                  <tr key={item.paymentItemId}>
                    <td className={`${cellBorder} text-center text-sm text-gray-600 py-2`}>
                      {idx + 1}
                    </td>
                    <td className={`${cellBorder} text-sm text-gray-800 py-2 px-3`}>{item.name}</td>
                    <td
                      className={`${cellBorder} text-sm text-right text-gray-600 py-2 px-3`}
                      style={numeric}
                    >
                      {formatNaira(item.totalAmount)}
                    </td>
                    <td
                      className={`${cellBorder} text-sm text-right font-semibold text-rose-700 py-2 px-3`}
                      style={numeric}
                    >
                      {formatNaira(item.currentBalance)}
                    </td>
                    <td className={`${cellBorder} text-sm text-right text-gray-600 py-2 px-3`}>
                      {item.dueDate ? formatDate(item.dueDate) : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className={`${cellBorder} text-center text-sm text-gray-400 italic py-4`}>
                    All fees are settled — no outstanding items.
                  </td>
                </tr>
              )}
              <tr className="bg-sky-50">
                <td className={cellBorder} />
                <td className={`${cellBorder} text-sm font-bold text-gray-900 py-2 px-3`}>
                  TOTAL OUTSTANDING
                </td>
                <td className={cellBorder} />
                <td
                  className={`${cellBorder} text-sm font-bold text-right text-rose-700 py-2 px-3`}
                  style={numeric}
                >
                  {formatNaira(totalOutstanding)}
                </td>
                <td className={cellBorder} />
              </tr>
            </tbody>
          </table>

          {/* Grand total bar */}
          <div
            className={`mt-0 border-2 px-4 py-3 flex items-center justify-between ${
              isFullyPaid
                ? "bg-green-50 border-green-400"
                : "bg-rose-50 border-rose-300"
            }`}
          >
            <p
              className={`text-sm font-extrabold uppercase ${
                isFullyPaid ? "text-green-800" : "text-rose-800"
              }`}
            >
              {isFullyPaid ? `Paid in Full — ${feeProfile.name}` : `Balance Due — ${feeProfile.name}`}
            </p>
            <p
              className={`text-lg font-extrabold ${isFullyPaid ? "text-green-800" : "text-rose-800"}`}
              style={numeric}
            >
              {formatNaira(totalOutstanding)}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-10 pt-5 border-t border-gray-200 flex items-end justify-between gap-6">
            <p className="text-[11px] text-gray-400 max-w-[380px]">
              {isFullyPaid
                ? "No further action required. Thank you for your prompt payment."
                : "Please clear the outstanding balance at your earliest convenience via the parent portal or school office."}
              <br />
              This is a system-generated receipt and does not require a signature.
            </p>
            <div className="text-right shrink-0">
              <p className="text-[11px] text-gray-400">
                Generated {formatDate(generatedAt, "DD MMM YYYY, h:mm A")}
              </p>
              <p className="text-[11px] font-bold text-purple-600 mt-0.5">FlexEdu</p>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

ReceiptTemplate.displayName = "ReceiptTemplate";
