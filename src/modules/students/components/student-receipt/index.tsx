"use client";

import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
import { Download, Loader } from "lucide-react";
import { RootState } from "@/redux/store";
import { StudentFeeProfile } from "@/@types/transaction";
import { SchoolProfile } from "@/@types/school";
import {
  useLazyGetStudentFeeProfileQuery,
  useLazyGetTransactionsQuery,
} from "@/redux/api/transaction";
import { useLazyGetShoolProfileQuery } from "@/redux/api/school";
import { useLazyGetAllAcademicSessionQuery } from "@/redux/api/academicSession";
import { showerror, showsuccess } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { downloadNodeAsPdf, waitForImagesToLoad } from "@/utils/pdf";
import { ReceiptTemplate } from "./receipt-template";

interface ReceiptPayload {
  school?: SchoolProfile;
  feeProfile: StudentFeeProfile;
  paidDatesByItemId: Record<string, string | undefined>;
  generatedAt: string;
  receiptNumber: string;
  termLabel?: string;
}

interface StudentReceiptButtonProps {
  studentId: string;
  variant?: "icon" | "button" | "hidden";
  disabled?: boolean;
  className?: string;
  /**
   * For variant="hidden": bump this (e.g. Date.now()) to fire a download
   * programmatically. Needed when the visible trigger lives somewhere that
   * unmounts immediately after the click — e.g. a dropdown menu item that
   * closes on click — which would otherwise abort the in-flight download.
   */
  trigger?: number;
}

export function StudentReceiptButton({
  studentId,
  variant = "icon",
  disabled = false,
  className,
  trigger,
}: StudentReceiptButtonProps) {
  const { currentUser } = useSelector((state: RootState) => state.authState);
  const [isGenerating, setIsGenerating] = useState(false);
  const [receiptPayload, setReceiptPayload] = useState<ReceiptPayload | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const [triggerFeeProfile] = useLazyGetStudentFeeProfileQuery();
  const [triggerSchool] = useLazyGetShoolProfileQuery();
  const [triggerTransactions] = useLazyGetTransactionsQuery();
  const [triggerAcademicPeriods] = useLazyGetAllAcademicSessionQuery();

  useEffect(() => {
    if (!receiptPayload) return;

    let cancelled = false;

    (async () => {
      try {
        await new Promise((resolve) => requestAnimationFrame(resolve));
        const node = receiptRef.current;
        if (!node) throw new Error("Receipt failed to render");

        await waitForImagesToLoad(node);
        if (cancelled) return;

        const filename = `Receipt-${receiptPayload.feeProfile.name.replace(/\s+/g, "_")}-${receiptPayload.feeProfile.admissionNumber}.pdf`;
        await downloadNodeAsPdf(node, filename);
        if (!cancelled) showsuccess("Receipt downloaded successfully");
      } catch {
        if (!cancelled) showerror("Failed to generate receipt");
      } finally {
        if (!cancelled) {
          setReceiptPayload(null);
          setIsGenerating(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [receiptPayload]);

  const handleDownload = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const feeRes = await triggerFeeProfile(studentId).unwrap();
      const feeProfile = feeRes.data;

      const schoolRes = await triggerSchool().unwrap();
      const school = schoolRes.data;

      const paidDatesByItemId: Record<string, string | undefined> = {};
      try {
        const txRes = await triggerTransactions({
          schoolId: String(currentUser?.schoolId),
          search: feeProfile.admissionNumber,
          status: "PAID",
          limit: 200,
        }).unwrap();

        const relevantTransactions = (txRes.data?.items ?? []).filter(
          (t) => t.student?._id === studentId && t.status === "PAID",
        );

        feeProfile.paymentItem.forEach((item) => {
          const matches = relevantTransactions.filter(
            (t) => t.paymentItem?._id === item.paymentItemId,
          );
          if (matches.length > 0) {
            // Prefer transactions that actually settled the item — a PAID
            // transaction with closesPaymentItem: false (an underpaid
            // transfer, or a partial wallet redemption) isn't the item's
            // real settlement date. closesPaymentItem may be absent on
            // older records, so treat undefined as "assume it settled."
            const settlingMatches = matches.filter((t) => t.closesPaymentItem !== false);
            const candidates = settlingMatches.length > 0 ? settlingMatches : matches;
            const latest = candidates.reduce((a, b) =>
              new Date(a.createdAt) > new Date(b.createdAt) ? a : b,
            );
            paidDatesByItemId[item.paymentItemId] = latest.createdAt;
          }
        });
      } catch {
        // Payment-date enrichment is best-effort; the receipt still renders without it.
      }

      let termLabel: string | undefined;
      try {
        const periodsRes = await triggerAcademicPeriods().unwrap();
        termLabel =
          periodsRes.data?.items
            ?.filter((p) => p.isActive)
            .map((p) => p.name)
            .join(" · ") || undefined;
      } catch {
        // Term label is best-effort; the receipt still renders without it.
      }

      setReceiptPayload({
        school,
        feeProfile,
        paidDatesByItemId,
        generatedAt: new Date().toISOString(),
        receiptNumber: `RCPT-${feeProfile.admissionNumber}-${dayjs().format("YYYYMMDDHHmmss")}`,
        termLabel,
      });
    } catch (error: any) {
      showerror(error?.data?.message || "Failed to load receipt data");
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
          title="Download Receipt"
        >
          {isGenerating ? (
            <Loader size={18} className="animate-spin" />
          ) : (
            <Download size={18} />
          )}
        </button>
      ) : variant === "hidden" ? null : (
        <button
          disabled={disabled || isGenerating}
          onClick={handleDownload}
          className={cn(
            "flex items-center gap-1.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            className,
          )}
        >
          {isGenerating ? (
            <Loader size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          {isGenerating ? "Preparing..." : "Download Receipt"}
        </button>
      )}

      {receiptPayload &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: "-10000px",
              pointerEvents: "none",
            }}
          >
            <ReceiptTemplate
              ref={receiptRef}
              school={receiptPayload.school}
              feeProfile={receiptPayload.feeProfile}
              paidDatesByItemId={receiptPayload.paidDatesByItemId}
              generatedAt={receiptPayload.generatedAt}
              receiptNumber={receiptPayload.receiptNumber}
              termLabel={receiptPayload.termLabel}
            />
          </div>,
          document.body,
        )}
    </>
  );
}
