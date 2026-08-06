import { forwardRef } from "react";
import { StudentFeeProfile, StudentFeeProfilePaymentItem } from "@/@types/transaction";
import { SchoolProfile } from "@/@types/school";
import { formatNaira, formatDate } from "@/utils/functions";

interface ReceiptTemplateProps {
  school?: SchoolProfile;
  feeProfile: StudentFeeProfile;
  paidDatesByItemId: Record<string, string | undefined>;
  generatedAt: string;
  receiptNumber: string;
}

const numeric: React.CSSProperties = { fontVariantNumeric: "tabular-nums" };

function StatusPill({ status }: { status: StudentFeeProfilePaymentItem["status"] }) {
  const map: Record<StudentFeeProfilePaymentItem["status"], string> = {
    COMPLETED: "bg-green-100 text-green-700",
    PART_PAYMENT: "bg-amber-100 text-amber-700",
    OUTSTANDING: "bg-rose-100 text-rose-700",
  };
  const label: Record<StudentFeeProfilePaymentItem["status"], string> = {
    COMPLETED: "Paid",
    PART_PAYMENT: "Part Paid",
    OUTSTANDING: "Unpaid",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${map[status]}`}>
      {label[status]}
    </span>
  );
}

export const ReceiptTemplate = forwardRef<HTMLDivElement, ReceiptTemplateProps>(
  ({ school, feeProfile, paidDatesByItemId, generatedAt, receiptNumber }, ref) => {
    const items = feeProfile.paymentItem ?? [];
    const paidItems = items.filter((item) => item.status === "COMPLETED");
    const outstandingItems = items.filter((item) => item.status !== "COMPLETED");

    const totalBilled = items.reduce((sum, item) => sum + item.totalAmount, 0);
    const totalPaid = items.reduce((sum, item) => sum + item.amountPaidPreviously, 0);
    const totalOutstanding = feeProfile.totalExpectedBalance ?? 0;
    const isFullyPaid = totalOutstanding <= 0;

    return (
      <div
        ref={ref}
        className="bg-white text-gray-900"
        style={{ width: "794px", fontFamily: "Arial, Helvetica, sans-serif" }}
      >
        {/* Branded header band */}
        <div
          className="px-14 py-10 flex items-start justify-between"
          style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}
        >
          <div className="flex items-center gap-4">
            {school?.logoUrl?.url ? (
              <div className="w-16 h-16 rounded-xl bg-white p-1 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={school.logoUrl.url}
                  crossOrigin="anonymous"
                  alt={school?.name || "School logo"}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-white/15 border border-white/30 flex items-center justify-center text-white font-bold text-2xl shrink-0">
                {school?.name?.charAt(0) || "S"}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-white leading-tight">
                {school?.name || "School Name"}
              </h1>
              {school?.address && (
                <p className="text-xs text-white/75 mt-1 max-w-[300px]">{school.address}</p>
              )}
              <p className="text-xs text-white/75 mt-0.5">
                {[school?.contactEmail, school?.contactPhone].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-3xl font-extrabold tracking-wider text-white">RECEIPT</p>
            <div className="mt-3 inline-block text-left bg-white/10 border border-white/20 rounded-lg px-4 py-2.5">
              <p className="text-[11px] text-white/70">
                Receipt No
              </p>
              <p className="text-sm font-mono font-semibold text-white -mt-0.5">{receiptNumber}</p>
              <p className="text-[11px] text-white/70 mt-1.5">Date Issued</p>
              <p className="text-sm font-semibold text-white -mt-0.5">{formatDate(generatedAt)}</p>
            </div>
          </div>
        </div>

        <div className="px-14 py-10">
          {/* Student info */}
          <div className="flex items-start justify-between border-b border-gray-100 pb-6">
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Prepared For
              </p>
              <p className="text-lg font-bold text-gray-900 mt-1">{feeProfile.name}</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Admission No: <span className="font-medium text-gray-700">{feeProfile.admissionNumber}</span>
                {" · "}
                Class: <span className="font-medium text-gray-700">{feeProfile.class?.name}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Account Status
              </p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                  isFullyPaid ? "bg-green-100 text-green-700" : "bg-rose-100 text-rose-700"
                }`}
              >
                {isFullyPaid ? "Fully Paid" : "Balance Outstanding"}
              </span>
            </div>
          </div>

          {/* Summary tiles */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
              <p className="text-[11px] text-indigo-600 font-semibold uppercase tracking-wider mb-1">
                Total Billed
              </p>
              <p className="text-xl font-bold text-indigo-900" style={numeric}>
                {formatNaira(totalBilled)}
              </p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <p className="text-[11px] text-green-600 font-semibold uppercase tracking-wider mb-1">
                Total Paid
              </p>
              <p className="text-xl font-bold text-green-800" style={numeric}>
                {formatNaira(totalPaid)}
              </p>
            </div>
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
              <p className="text-[11px] text-rose-600 font-semibold uppercase tracking-wider mb-1">
                Outstanding Balance
              </p>
              <p className="text-xl font-bold text-rose-800" style={numeric}>
                {formatNaira(totalOutstanding)}
              </p>
            </div>
          </div>

          {/* Paid items */}
          <div className="mt-9">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              Paid Items
            </h2>
            {paidItems.length > 0 ? (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left text-[11px] font-semibold text-gray-500 uppercase px-4 py-2.5">
                        Item
                      </th>
                      <th className="text-right text-[11px] font-semibold text-gray-500 uppercase px-4 py-2.5">
                        Amount
                      </th>
                      <th className="text-right text-[11px] font-semibold text-gray-500 uppercase px-4 py-2.5">
                        Date Paid
                      </th>
                      <th className="text-right text-[11px] font-semibold text-gray-500 uppercase px-4 py-2.5">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paidItems.map((item, idx) => (
                      <tr
                        key={item.paymentItemId}
                        className={idx % 2 === 1 ? "bg-gray-50/60" : "bg-white"}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.name}</td>
                        <td className="px-4 py-3 text-sm text-right text-green-700 font-semibold" style={numeric}>
                          {formatNaira(item.amountPaidPreviously)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-500">
                          {paidDatesByItemId[item.paymentItemId]
                            ? formatDate(paidDatesByItemId[item.paymentItemId] as string)
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <StatusPill status={item.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic px-1">No fee items have been paid yet.</p>
            )}
          </div>

          {/* Outstanding items */}
          <div className="mt-8">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              Outstanding Items
            </h2>
            {outstandingItems.length > 0 ? (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left text-[11px] font-semibold text-gray-500 uppercase px-4 py-2.5">
                        Item
                      </th>
                      <th className="text-right text-[11px] font-semibold text-gray-500 uppercase px-4 py-2.5">
                        Total
                      </th>
                      <th className="text-right text-[11px] font-semibold text-gray-500 uppercase px-4 py-2.5">
                        Paid
                      </th>
                      <th className="text-right text-[11px] font-semibold text-gray-500 uppercase px-4 py-2.5">
                        Balance
                      </th>
                      <th className="text-right text-[11px] font-semibold text-gray-500 uppercase px-4 py-2.5">
                        Due Date
                      </th>
                      <th className="text-right text-[11px] font-semibold text-gray-500 uppercase px-4 py-2.5">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {outstandingItems.map((item, idx) => (
                      <tr
                        key={item.paymentItemId}
                        className={idx % 2 === 1 ? "bg-gray-50/60" : "bg-white"}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.name}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600" style={numeric}>
                          {formatNaira(item.totalAmount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-500" style={numeric}>
                          {formatNaira(item.amountPaidPreviously)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-rose-700 font-semibold" style={numeric}>
                          {formatNaira(item.currentBalance)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-500">
                          {item.dueDate ? formatDate(item.dueDate) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <StatusPill status={item.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic px-1">
                All fees are settled — no outstanding items.
              </p>
            )}
          </div>

          {/* Balance due callout */}
          <div className="mt-8 flex justify-end">
            <div
              className={`relative w-72 rounded-xl border p-5 ${
                isFullyPaid
                  ? "bg-green-50 border-green-200"
                  : "bg-rose-50 border-rose-200"
              }`}
            >
              {isFullyPaid && (
                <div
                  className="absolute -top-3 -right-3 border-2 border-green-600 text-green-600 bg-white text-[11px] font-extrabold uppercase px-3 py-1 rounded"
                  style={{ transform: "rotate(8deg)" }}
                >
                  Paid in Full
                </div>
              )}
              <p
                className={`text-[11px] font-semibold uppercase tracking-wider mb-1 ${
                  isFullyPaid ? "text-green-600" : "text-rose-600"
                }`}
              >
                Balance Due
              </p>
              <p
                className={`text-2xl font-extrabold ${isFullyPaid ? "text-green-800" : "text-rose-800"}`}
                style={numeric}
              >
                {formatNaira(totalOutstanding)}
              </p>
            </div>
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
