"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Eye, EyeOff, Loader } from "lucide-react";
import {
  LockIcon,
  PersonIcon,
  PhoneIcon,
  SchoolNameIcon,
  SchoolTypeIcon,
} from "@/icon/auth/icon";
import { useSignUpMutation } from "@/redux/api/auth";
import { showerror, showsuccess } from "@/utils/toast";

const schoolType = z.enum(["Private", "Public"] as const);
const signUpSchema = z.object({
  name: z.string().min(2, "School name must be at least 2 characters"),
  address: z.string().min(2, "School address must be at least 5 characters"),
  schoolType: schoolType,
  contactName: z.string().min(2, "Contact person name is required"),
  contactPhone: z.string().regex(/^\d{11}$/, "Phone number must be 11 digits"),
  contactEmail: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
  agreeToPrivacy: z.boolean().refine((val) => val === true, {
    message: "You must agree to the privacy policy",
  }),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignupView() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [signUp, { isLoading }] = useSignUpMutation();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      agreeToTerms: false,
      agreeToPrivacy: false,
    },
  });

  const agreeToTerms = watch("agreeToTerms");
  const agreeToPrivacy = watch("agreeToPrivacy");

  const onSubmit = async (data: SignUpFormData) => {
    try {
      const res = await signUp({
        name: data.name,
        address: data.address,
        contactEmail: data.contactEmail,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        schoolType: data.schoolType,
        password: data.password,
      }).unwrap();
      console.log("Sign up successful:", res);
      showsuccess("Sign up successful! Please verify your email.");
      router.push(
        "/auth/verify-otp?email=" + encodeURIComponent(data.contactEmail),
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      showerror(error.data?.message || "Sign up failed. Please try again.");
    }
    console.log("[v0] Sign up form data:", data);
    // Navigate to OTP verification
    // router.push("/auth/verify-otp");
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Let&apos;s Get Started
        </h2>
        <p className="text-gray-500">
          Already have an account?{" "}
          <Link
            href="/auth/sign-in"
            className="text-violet-600 hover:text-violet-700 font-medium"
          >
            Log in
          </Link>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <h3 className="text-xl font-semibold text-gray-900">Sign up</h3>

        {/* School Name */}
        <div>
          <label
            htmlFor="schoolName"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            School Name
          </label>
          <div className="relative">
            <SchoolNameIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              {...register("name")}
              id="schoolName"
              type="text"
              placeholder="School name"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            School Address
          </label>
          <div className="relative">
            <SchoolNameIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              {...register("address")}
              id="schoolName"
              type="text"
              placeholder="School name"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">
              {errors.address.message}
            </p>
          )}
        </div>

        {/* School Type */}
        <div>
          <label
            htmlFor="schoolType"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            School Type
          </label>
          <div className="relative">
            <SchoolTypeIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
            <select
              {...register("schoolType")}
              id="schoolType"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
            >
              <option value="">School Type</option>
              <option value="Private">Private School</option>
              <option value="Public">Public School</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path
                  d="M1 1L6 6L11 1"
                  stroke="#9CA3AF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          {errors.schoolType && (
            <p className="mt-1 text-sm text-red-600">
              {errors.schoolType.message}
            </p>
          )}
        </div>

        {/* Primary Contact Person */}
        <div>
          <label
            htmlFor="contactName"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Primary Contact Person
          </label>
          <div className="relative">
            <PersonIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              {...register("contactName")}
              id="contactName"
              type="text"
              placeholder="Narayan Murthy"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          {errors.contactName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.contactName.message}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label
            htmlFor="contactPhone"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Phone Number
          </label>
          <div className="relative">
            <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              {...register("contactPhone")}
              id="contactPhone"
              type="tel"
              placeholder="0801234567"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          {errors.contactPhone && (
            <p className="mt-1 text-sm text-red-600">
              {errors.contactPhone.message}
            </p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label
            htmlFor="contactEmail"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              {...register("contactEmail")}
              id="contactEmail"
              type="contactEmail"
              placeholder="NarayanMurthy@gmail.com"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          {errors.contactEmail && (
            <p className="mt-1 text-sm text-red-600">
              {errors.contactEmail.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              {...register("password")}
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••••••••"
              className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <input
              {...register("agreeToTerms")}
              id="agreeToTerms"
              type="checkbox"
              className="mt-1 w-4 h-4 border-gray-300 rounded accent-violet-500 text-violet-600 focus:ring-violet-500 cursor-pointer"
            />
            <label htmlFor="agreeToTerms" className="text-sm text-gray-600 cursor-pointer">
              I agree to platforms{" "}
              <Link href="#" className="text-violet-600 hover:text-violet-700">
                Terms of service
              </Link>
            </label>
          </div>
          {errors.agreeToTerms && (
            <p className="text-sm text-red-600">{errors.agreeToTerms.message}</p>
          )}

          <div className="flex items-start gap-2">
            <input
              {...register("agreeToPrivacy")}
              id="agreeToPrivacy"
              type="checkbox"
              className="mt-1 w-4 h-4 border-gray-300 rounded accent-violet-500 text-violet-600 focus:ring-violet-500 cursor-pointer"
            />
            <label htmlFor="agreeToPrivacy" className="text-sm text-gray-600 cursor-pointer">
              I agree to platforms{" "}
              <Link href="#" className="text-violet-600 hover:text-violet-700">
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.agreeToPrivacy && (
            <p className="text-sm text-red-600">{errors.agreeToPrivacy.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !agreeToTerms || !agreeToPrivacy}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 rounded-lg active:scale-95  transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader className="mx-auto animate-spin" /> : "Register"}
        </button>
      </form>
    </div>
  );
}
