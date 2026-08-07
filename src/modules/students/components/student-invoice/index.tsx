"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
import { FileText, Loader } from "lucide-react";
import { StudentFeeProfile } from "@/@types/transaction";
import { SchoolProfile } from "@/@types/school";
import { useLazyGetStudentFeeProfileQuery } from "@/redux/api/transaction";
import { useLazyGetShoolProfileQuery } from "@/redux/api/school";
import { useLazyGetAllAcademicSessionQuery } from "@/redux/api/academicSession";
import { showerror, showsuccess } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { downloadNodeAsPdf, waitForImagesToLoad } from "@/utils/pdf";
import { InvoiceTemplate } from "./invoice-template";

interface InvoicePayload {
  school?: SchoolProfile;
  feeProfile: StudentFeeProfile;
  generatedAt: string;
  invoiceNumber: string;
  termLabel?: string;
}

interface StudentInvoiceButtonProps {
  studentId: string;
  variant?: "icon" | "button" | "hidden";
  disabled?: boolean;
  className?: string;
  /** For variant="hidden": bump this (e.g. Date.now()) to fire a download
   * programmatically — see StudentReceiptButton for why this exists. */
  trigger?: number;
}

export function StudentInvoiceButton({
  studentId,
  variant = "icon",
  disabled = false,
  className,
  trigger,
}: StudentInvoiceButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [invoicePayload, setInvoicePayload] = useState<InvoicePayload | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [triggerFeeProfile] = useLazyGetStudentFeeProfileQuery();
  const [triggerSchool] = useLazyGetShoolProfileQuery();
  const [triggerAcademicPeriods] = useLazyGetAllAcademicSessionQuery();

  useEffect(() => {
    if (!invoicePayload) return;

    let cancelled = false;

    (async () => {
      try {
        await new Promise((resolve) => requestAnimationFrame(resolve));
        const node = invoiceRef.current;
        if (!node) throw new Error("Invoice failed to render");

        await waitForImagesToLoad(node);
        if (cancelled) return;

        const filename = `Invoice-${invoicePayload.feeProfile.name.replace(/\s+/g, "_")}-${invoicePayload.feeProfile.admissionNumber}.pdf`;
        await downloadNodeAsPdf(node, filename);
        if (!cancelled) showsuccess("Invoice downloaded successfully");
      } catch {
        if (!cancelled) showerror("Failed to generate invoice");
      } finally {
        if (!cancelled) {
          setInvoicePayload(null);
          setIsGenerating(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [invoicePayload]);

  const handleDownload = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const feeRes = await triggerFeeProfile(studentId).unwrap();
      const feeProfile = feeRes.data;

      const schoolRes = await triggerSchool().unwrap();
      const school = schoolRes.data;

      let termLabel: string | undefined;
      try {
        const periodsRes = await triggerAcademicPeriods().unwrap();
        termLabel =
          periodsRes.data?.items
            ?.filter((p) => p.isActive)
            .map((p) => p.name)
            .join(" · ") || undefined;
      } catch {
        // Term label is best-effort; the invoice still renders without it.
      }

      setInvoicePayload({
        school,
        feeProfile,
        generatedAt: new Date().toISOString(),
        invoiceNumber: `INV-${feeProfile.admissionNumber}-${dayjs().format("YYYYMMDDHHmmss")}`,
        termLabel,
      });
    } catch (error: any) {
      showerror(error?.data?.message || "Failed to load invoice data");
      setIsGenerating(false);
    }
  };

  const hasTriggeredRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (variant !== "hidden" || !trigger || hasTriggeredRef.current === trigger) return;
    hasTriggeredRef.current = trigger;
    handleDownload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, trigger, studentId]);

  return (
    <>
      {variant === "icon" ? (
        <button
          disabled={disabled || isGenerating}
          onClick={handleDownload}
          className={cn(
            "text-sm text-gray-700 hover:text-indigo-600 underline disabled:opacity-50 disabled:cursor-not-allowed",
            className,
          )}
          title="Download Invoice"
        >
          {isGenerating ? (
            <Loader size={18} className="animate-spin" />
          ) : (
            <FileText size={18} />
          )}
        </button>
      ) : variant === "hidden" ? null : (
        <button
          disabled={disabled || isGenerating}
          onClick={handleDownload}
          className={cn(
            "flex items-center gap-1.5 text-sm font-semibold text-white bg-gray-700 hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            className,
          )}
        >
          {isGenerating ? (
            <Loader size={16} className="animate-spin" />
          ) : (
            <FileText size={16} />
          )}
          {isGenerating ? "Preparing..." : "Download Invoice"}
        </button>
      )}

      {invoicePayload &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: "-10000px",
              pointerEvents: "none",
            }}
          >
            <InvoiceTemplate
              ref={invoiceRef}
              school={invoicePayload.school}
              feeProfile={invoicePayload.feeProfile}
              generatedAt={invoicePayload.generatedAt}
              invoiceNumber={invoicePayload.invoiceNumber}
              termLabel={invoicePayload.termLabel}
            />
          </div>,
          document.body,
        )}
    </>
  );
}
