"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type OTPFormData = z.infer<typeof otpSchema>;

export default function VerifyOtpView() {
  const router = useRouter();
  const [otp, setOtp] = React.useState(["", "", "", "", "", ""]);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
  });

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setValue("otp", newOtp.join(""));

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData
      .split("")
      .concat(Array(6 - pastedData.length).fill(""));
    setOtp(newOtp);
    setValue("otp", newOtp.join(""));

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const onSubmit = (data: OTPFormData) => {
    console.log("[v0] OTP verification data:", data);
    router.push("/auth/sign-in");
  };

  const handleResendOTP = () => {
    console.log("[v0] Resending OTP...");
    setOtp(["", "", "", "", "", ""]);
    setValue("otp", "");
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          We Have Sent You An OTP On Registered E-mail Address
        </h2>
        <p className="text-gray-500">
          NarayanMurthy@gmail.com,{" "}
          <Link
            href="/sign-up"
            className="text-violet-600 hover:text-violet-700 font-medium"
          >
            Change E-mail address
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-center gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-14 h-14 text-center text-2xl font-bold border-b-2 border-gray-300 focus:border-violet-600 outline-none transition-colors"
              style={{
                color: digit ? "#7C3AED" : "#D1D5DB",
              }}
            />
          ))}
        </div>

        {errors.otp && (
          <p className="text-sm text-red-600 text-center">
            {errors.otp.message}
          </p>
        )}

        <div className="text-center">
          <span className="text-gray-500">Don&spos;t Receive the OTP ? </span>
          <button
            type="button"
            onClick={handleResendOTP}
            className="text-violet-600 hover:text-violet-700 font-medium"
          >
            Resend OTP
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 rounded-lg transition-colors"
        >
          Verify and Proceed
        </button>
      </form>
    </div>
  );
}
