"use client";

import { Mail, Loader2 } from "lucide-react";
import { useResendParentInviteMutation } from "@/redux/api/parent";
import { showerror, showsuccess } from "@/utils/toast";
import { cn } from "@/lib/utils";

interface ResendInviteButtonProps {
  email: string;
  isRegistered?: boolean;
  className?: string;
  /** "solid" reads as the primary action on a card (default). "outline"
   * for contexts that already have a primary action nearby. */
  variant?: "solid" | "outline";
}

export function ResendInviteButton({
  email,
  isRegistered,
  className,
  variant = "solid",
}: ResendInviteButtonProps) {
  const [resendParentInvite, { isLoading }] = useResendParentInviteMutation();

  const handleClick = async () => {
    try {
      const res = await resendParentInvite({ email }).unwrap();
      showsuccess(res?.message || `Invitation resent to ${email}`);
    } catch (error: any) {
      showerror(error?.data?.message || "Failed to resend invitation");
    }
  };

  const label = isRegistered ? "Resend Login Link" : "Resend Invite";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      aria-label={`${label} to ${email}`}
      title={`${label} to ${email}`}
      className={cn(
        "flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-purple-500",
        variant === "solid"
          ? "bg-purple-600 text-white hover:bg-purple-700 shadow-sm"
          : "bg-white text-purple-700 border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300",
        className,
      )}
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Mail size={16} />
      )}
      {isLoading ? "Sending..." : label}
    </button>
  );
}
