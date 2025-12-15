"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Loader } from "lucide-react";
import { useForgotPasswordMutation } from "@/redux/api/auth";
import { showsuccess } from "@/utils/toast";

const forgotPasswordSchema = z.object({
  email: z.email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordView() {
  const router = useRouter();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const res = await forgotPassword(data).unwrap();
      router.push(
        `/auth/reset-password?email=${encodeURIComponent(data.email)}`
      );
      showsuccess(res?.message || "OTP sent successfully");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Forgot Password
        </h2>
        <p className="text-gray-500 mb-1 text-center">
          No worries, We will send you reset instructions.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              {...register("email")}
              id="email"
              type="email"
              placeholder="NarayanMurthy@gmail.com"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 active:scale-95  rounded-lg transition-colors"
        >
          {isLoading ? (
            <Loader className="mx-auto animaate-spin" />
          ) : (
            "Reset Password"
          )}
        </button>
      </form>
    </div>
  );
}
