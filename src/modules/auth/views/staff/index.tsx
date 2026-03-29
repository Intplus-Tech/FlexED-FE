"use client";

import { useEffect, useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetInviteDetailsQuery, useAcceptInviteMutation } from "@/redux/api/school";
import { User, Building2, Eye, EyeOff } from "lucide-react";
import { showerror, showsuccess } from "@/utils/toast";

function StaffInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const { data, isLoading, isError } = useGetInviteDetailsQuery(token, {
    skip: !token,
  });

  const [acceptInvite, { isLoading: isSubmitting }] = useAcceptInviteMutation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (formData: any) => {
    try {
      if (formData.password !== formData.confirmPassword) {
        showerror("Passwords do not match");
        return;
      }

      await acceptInvite({
        token,
        password: formData.password,
      }).unwrap();

      showsuccess("Invitation accepted successfully! You can now log in.");
      router.push("/auth/sign-in");
    } catch (error: any) {
      showerror(error?.data?.message || "Failed to accept invitation");
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h2>
        <p className="text-gray-600">This invitation link is missing a secure token.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-gray-500 font-medium">Verifying invitation...</p>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid or Expired Link</h2>
        <p className="text-gray-600">
          This invitation could not be verified. It may have expired or already been used.
        </p>
      </div>
    );
  }

  const { staff, school } = data.data;

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 mt-4 lg:mt-0">Accept Invitation</h2>
        <p className="text-gray-600 text-[15px] mb-8">
          Complete your account setup by creating a secure password.
        </p>
      </div>

      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 mb-8 space-y-4">
        <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
          <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
            {school.logoUrl?.url ? (
              <img src={school.logoUrl.url} alt={school.name} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-6 h-6 text-indigo-600" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Joining School</p>
            <p className="text-lg font-bold text-gray-900 leading-tight">{school.name}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 pt-1">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-700">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Staff Profile</p>
            <p className="font-semibold text-gray-900">{staff.firstName} {staff.lastName}</p>
            <p className="text-sm text-gray-600">{staff.email}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Create Password
          </label>
          <div className="relative">
            {/* <LockIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" /> */}
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••••••"
              {...register("password", { 
                required: "Password is required",
                minLength: { value: 8, message: "Password must be at least 8 characters" }
              })}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-shadow ${
                errors.password ? "border-red-500" : "border-gray-200"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            {/* <LockIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" /> */}
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••••••••••"
              {...register("confirmPassword", { 
                required: "Please confirm your password",
                validate: (val) => val === watch("password") || "Passwords do not match"
              })}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-shadow ${
                errors.confirmPassword ? "border-red-500" : "border-gray-200"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-colors duration-200 shadow-md disabled:opacity-50 mt-4"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Accepting Invitation..." : "Accept Invitation"}
        </button>
      </form>
    </div>
  );
}

export default function StaffInviteView() {
  return (
    <Suspense fallback={<div className="text-center py-12"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" /></div>}>
      <StaffInviteContent />
    </Suspense>
  );
}
