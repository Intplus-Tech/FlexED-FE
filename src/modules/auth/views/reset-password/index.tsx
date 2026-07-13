"use client";

import React, { useState, useRef, Suspense } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useResetPasswordMutation } from "@/redux/api/auth";
import { showerror, showsuccess } from "@/utils/toast";
import { LockIcon } from "@/icon/dashbaord";
import { Eye, EyeOff, Loader, CheckCircle, Circle } from "lucide-react";
import { LogoLoader } from "@/components/ui/logo-loader";

// ─── Step 1 schema ───────────────────────────────────────────────────────────
const otpSchema = z.object({
  token: z.string().length(10, "OTP must be 10 characters"),
});

// ─── Step 2 schema ───────────────────────────────────────────────────────────
const passwordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

// ─── Stepper indicator ───────────────────────────────────────────────────────
function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = ["Enter OTP", "Set Password"];
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((label, i) => {
        const step = i + 1;
        const isDone = currentStep > step;
        const isActive = currentStep === step;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isDone
                    ? "bg-violet-600 text-white"
                    : isActive
                      ? "bg-violet-600 text-white ring-4 ring-violet-100"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {isDone ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{step}</span>
                )}
              </div>
              <span
                className={`text-xs font-medium ${
                  isActive ? "text-violet-600" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-0.5 w-16 mb-4 rounded transition-all ${
                  currentStep > step ? "bg-violet-600" : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Main inner component ─────────────────────────────────────────────────────
function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [step, setStep] = useState<1 | 2>(1);
  const [storedToken, setStoredToken] = useState("");

  const OTP_LENGTH = 10;
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpError, setOtpError] = useState("");

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

  const handleOtpChange = (index: number, value: string) => {
    // allow letters and digits, uppercase
    if (value && !/^[a-zA-Z0-9]$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value.toUpperCase();
    setOtp(updated);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, OTP_LENGTH);
    const updated = pasted
      .split("")
      .concat(Array(OTP_LENGTH - pasted.length).fill(""));
    setOtp(updated);
    const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = otp.join("");
    if (token.length < OTP_LENGTH) {
      setOtpError("Please enter the complete 10-character OTP");
      return;
    }
    setOtpError("");
    setStoredToken(token);
    setStep(2);
  };

  // ── Password submit ───────────────────────────────────────────────────────
  const onPasswordSubmit: SubmitHandler<PasswordFormData> = async (data) => {
    try {
      const res = await resetPassword({
        email,
        token: storedToken,
        newPassword: data.newPassword,
        confirmPassword: data.confirmNewPassword,
      }).unwrap();
      showsuccess(res?.message || "Password reset successful");
      router.push("/auth/sign-in");
    } catch (error: unknown) {
      const err = error as { data?: { message?: string }; message?: string };
      showerror(err?.data?.message || err?.message || "Something went wrong");
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Reset Password
        </h2>
        <p className="text-gray-500 text-sm">
          {step === 1
            ? "Enter the OTP sent to your email to continue."
            : "Choose a strong new password."}
        </p>
      </div>

      {/* Stepper */}
      <StepIndicator currentStep={step} />

      {/* ── Step 1: OTP ── */}
      {step === 1 && (
        <form onSubmit={handleOtpSubmit} className="space-y-6">
          <div className="text-center mb-2">
            <p className="text-sm text-gray-600">
              OTP sent to{" "}
              <span className="font-semibold text-violet-600">{email}</span>
            </p>
          </div>

          {/* 10-box OTP input */}
          <div className="flex justify-center gap-1.5 whitespace-nowrap">
            {otp.map((char, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="text"
                maxLength={1}
                value={char}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onPaste={handleOtpPaste}
                className="w-10 h-12 text-center text-lg font-bold border-b-2 border-gray-300 focus:border-violet-600 outline-none transition-colors uppercase bg-transparent"
                style={{ color: char ? "#7C3AED" : "#D1D5DB" }}
              />
            ))}
          </div>

          {otpError && (
            <p className="text-sm text-red-600 text-center">{otpError}</p>
          )}

          <div className="text-center">
            <span className="text-gray-500 text-sm">
              Didn&apos;t receive the OTP?{" "}
            </span>
            <button
              type="button"
              onClick={() => setOtp(Array(OTP_LENGTH).fill(""))}
              className="text-violet-600 hover:text-violet-700 font-medium text-sm"
            >
              Clear
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 rounded-lg transition-colors active:scale-95"
          >
            Continue
          </button>
        </form>
      )}

      {/* ── Step 2: New Password ── */}
      {step === 2 && (
        <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-5">
          {/* New Password */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              New Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <LockIcon />
              </span>
              <input
                type={showNew ? "text" : "password"}
                id="newPassword"
                {...register("newPassword")}
                className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowNew((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmNewPassword"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Re-Enter Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <LockIcon />
              </span>
              <input
                type={showConfirm ? "text" : "password"}
                id="confirmNewPassword"
                {...register("confirmNewPassword")}
                className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmNewPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmNewPassword.message}
              </p>
            )}
          </div>

          {/* Back + Submit row */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 border border-gray-300 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors active:scale-95"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 rounded-lg transition-colors active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader className="mx-auto animate-spin w-5 h-5" />
              ) : (
                "Reset Password"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ─── Export with Suspense (required for useSearchParams) ─────────────────────
export default function ResetPasswordView() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          <LogoLoader size={80} />
        </div>
      }
    >
      <ResetPassword />
    </Suspense>
  );
}
