import { forwardRef } from "react";
import { StudentFeeProfile } from "@/@types/transaction";
import { SchoolProfile } from "@/@types/school";
import { formatNaira, formatDate } from "@/utils/functions";
import { DocumentHeader } from "../student-receipt/document-header";

interface InvoiceTemplateProps {
  school?: SchoolProfile;
  feeProfile: StudentFeeProfile;
  generatedAt: string;
  invoiceNumber: string;
  /** Active academic period(s), e.g. "2nd Term · 2025/2026 Session" */
  termLabel?: string;
}

const numeric: React.CSSProperties = { fontVariantNumeric: "tabular-nums" };
const cellBorder = "border border-gray-300";

export const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(
  ({ school, feeProfile, generatedAt, invoiceNumber, termLabel }, ref) => {
    const items = feeProfile.paymentItem ?? [];
    const grandTotal = items.reduce((sum, item) => sum + item.totalAmount, 0);

    return (
      <div
        ref={ref}
        className="bg-white text-gray-900"
        style={{ width: "794px", fontFamily: "Arial, Helvetica, sans-serif" }}
      >
        <DocumentHeader
          school={school}
          title="INVOICE"
          documentNumber={invoiceNumber}
          documentNumberLabel="Invoice No"
          generatedAt={generatedAt}
        />

        <div className="px-14 py-10">
          {/* Title */}
          <div className="text-center border-b-2 border-gray-800 pb-3 mb-4">
            {termLabel && (
              <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest mb-1">
                {termLabel}
              </p>
            )}
            <p className="text-base font-bold text-gray-900 uppercase tracking-wide">
              Fee Invoice — {feeProfile.name} ({feeProfile.class?.name})
            </p>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Admission No: <span className="font-semibold text-gray-800">{feeProfile.admissionNumber}</span>
          </p>

          {/* Items */}
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-sky-100">
                <th className={`${cellBorder} w-12 text-center text-xs font-bold text-gray-700 uppercase py-2`}>
                  S/N
                </th>
                <th className={`${cellBorder} text-left text-xs font-bold text-gray-700 uppercase py-2 px-3`}>
                  Class Items
                </th>
                <th className={`${cellBorder} text-right text-xs font-bold text-gray-700 uppercase py-2 px-3`}>
                  School Fees
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, idx) => (
                  <tr key={item.paymentItemId}>
                    <td className={`${cellBorder} text-center text-sm text-gray-600 py-2`}>
                      {idx + 1}
                    </td>
                    <td className={`${cellBorder} text-sm text-gray-800 py-2 px-3`}>{item.name}</td>
                    <td
                      className={`${cellBorder} text-sm text-right text-gray-800 py-2 px-3`}
                      style={numeric}
                    >
                      {formatNaira(item.totalAmount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className={`${cellBorder} text-center text-sm text-gray-400 italic py-4`}>
                    No fee items are currently applicable to this student.
                  </td>
                </tr>
              )}
              <tr className="bg-sky-50">
                <td className={cellBorder} />
                <td className={`${cellBorder} text-sm font-bold text-gray-900 py-2 px-3`}>
                  TOTAL
                </td>
                <td
                  className={`${cellBorder} text-sm font-bold text-right text-gray-900 py-2 px-3`}
                  style={numeric}
                >
                  {formatNaira(grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Grand total bar */}
          <div className="border-2 border-indigo-300 bg-indigo-50 px-4 py-3 flex items-center justify-between">
            <p className="text-sm font-extrabold text-indigo-800 uppercase">
              Total For {feeProfile.name}
            </p>
            <p className="text-lg font-extrabold text-indigo-800" style={numeric}>
              {formatNaira(grandTotal)}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-10 pt-5 border-t border-gray-200 flex items-end justify-between gap-6">
            <p className="text-[11px] text-gray-400 max-w-[420px]">
              This invoice lists fees applicable to this student and does not
              indicate that any payment has been made. For a record of
              payments already received, request a payment receipt instead.
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

InvoiceTemplate.displayName = "InvoiceTemplate";
