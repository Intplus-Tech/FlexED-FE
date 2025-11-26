"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  GraduationCap,
  Building2,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  LockIcon,
  PersonIcon,
  PhoneIcon,
  SchoolNameIcon,
  SchoolTypeIcon,
} from "@/icon/auth/icon";

const schoolType = z.enum(["private", "public"] as const);
const signUpSchema = z.object({
  schoolName: z.string().min(2, "School name must be at least 2 characters"),
  schoolType: schoolType,
  contactPerson: z.string().min(2, "Contact person name is required"),
  phoneNumber: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignupView() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = (data: SignUpFormData) => {
    console.log("[v0] Sign up form data:", data);
    // Navigate to OTP verification
    router.push("/auth/verify-otp");
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
            href="/login"
            className="text-violet-600 hover:text-violet-700 font-medium"
          >
            Log in
          </Link>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              {...register("schoolName")}
              id="schoolName"
              type="text"
              placeholder="School name"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          {errors.schoolName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.schoolName.message}
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
              <option value="private">Private School</option>
              <option value="public">Public School</option>
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
            htmlFor="contactPerson"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Primary Contact Person
          </label>
          <div className="relative">
            <PersonIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              {...register("contactPerson")}
              id="contactPerson"
              type="text"
              placeholder="Narayan Murthy"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          {errors.contactPerson && (
            <p className="mt-1 text-sm text-red-600">
              {errors.contactPerson.message}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Phone Number
          </label>
          <div className="relative">
            <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              {...register("phoneNumber")}
              id="phoneNumber"
              type="tel"
              placeholder="0801234567"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-600">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>

        {/* Email Address */}
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

        <div className="flex items-start gap-2">
          <input
            {...register("agreeToTerms")}
            id="agreeToTerms"
            type="checkbox"
            className="mt-1 w-4 h-4 border-gray-300 rounded accent-violet-500 text-violet-600 focus:ring-violet-500"
          />
          <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
            I agree to platforms{" "}
            <Link href="#" className="text-violet-600 hover:text-violet-700">
              Terms of service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-violet-600 hover:text-violet-700">
              Privacy Policy
            </Link>
          </label>
        </div>
        {errors.agreeToTerms && (
          <p className="text-sm text-red-600">{errors.agreeToTerms.message}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 rounded-lg transition-colors"
        >
          Register
        </button>
      </form>
    </div>
  );
}
