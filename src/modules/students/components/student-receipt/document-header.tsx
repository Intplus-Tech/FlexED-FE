import { SchoolProfile } from "@/@types/school";
import { formatDate } from "@/utils/functions";

interface DocumentHeaderProps {
  school?: SchoolProfile;
  /** e.g. "RECEIPT" or "INVOICE" */
  title: string;
  documentNumber: string;
  documentNumberLabel?: string;
  generatedAt: string;
}

export function DocumentHeader({
  school,
  title,
  documentNumber,
  documentNumberLabel = `${title.charAt(0)}${title.slice(1).toLowerCase()} No`,
  generatedAt,
}: DocumentHeaderProps) {
  return (
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
        <p className="text-3xl font-extrabold tracking-wider text-white">{title}</p>
        <div className="mt-3 inline-block text-left bg-white/10 border border-white/20 rounded-lg px-4 py-2.5">
          <p className="text-[11px] text-white/70">{documentNumberLabel}</p>
          <p className="text-sm font-mono font-semibold text-white -mt-0.5">
            {documentNumber}
          </p>
          <p className="text-[11px] text-white/70 mt-1.5">Date Issued</p>
          <p className="text-sm font-semibold text-white -mt-0.5">
            {formatDate(generatedAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
