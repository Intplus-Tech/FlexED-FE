"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Lock, Eye, EyeOff, Loader } from "lucide-react";
import { getSession, signIn } from "next-auth/react";
import { showerror, showsuccess } from "@/utils/toast";
import { useDispatch } from "react-redux";
import { setAuth } from "@/redux/slice/auth";
import { SignInResponse } from "@/@types/auth";

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginView() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    if (data.email && data.password) {
      setIsLoading(true);
      const res = await signIn("credentials", {
        email: data.email.trim(),
        password: data.password.trim(),
        redirect: false,
      });

      if (res?.ok) {
        const newSession = await getSession();
        showsuccess("Success");
        const Data = newSession as unknown as {
          accessToken: string;
          user: SignInResponse["data"]["user"];
        };

        dispatch(
          setAuth({
            accessToken: Data.accessToken,
            currentUser: Data.user,
          }),
        );
        router.push("/dashboard");
      } else showerror(res?.error ?? "Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Hey, Hello</h2>
        <p className="text-gray-500 mb-1">
          Welcome back, Enter your login information
        </p>
        <Link
          href="/auth/sign-up"
          className="text-violet-600 hover:text-violet-700 font-medium"
        >
          Create Account
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <h3 className="text-xl font-semibold text-gray-900">Login</h3>

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

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
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

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              {...register("rememberMe")}
              id="rememberMe"
              type="checkbox"
              className="w-4 h-4 border-gray-300 rounded text-violet-600 focus:ring-violet-500"
            />
            <label htmlFor="rememberMe" className="text-sm text-gray-700">
              Remember me
            </label>
          </div>
          <button
            type="button"
            onClick={() => router.push("/auth/forgot-password")}
            className="text-sm text-violet-600 hover:text-violet-700 outline-none"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 rounded-lg transition-colors active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader className="mx-auto animate-spin" /> : "Login"}
        </button>
      </form>
    </div>
  );
}
