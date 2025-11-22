"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  paymentSettingsSchema,
  type PaymentSettingsFormData,
} from "@/lib/validations";

export function PaymentSettingsTab() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PaymentSettingsFormData>({
    resolver: zodResolver(paymentSettingsSchema),
  });

  const onSubmit = async (data: PaymentSettingsFormData) => {
    console.log("[v0] Payment settings submitted:", data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <div className="max-w-5xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Settlement Account */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Settlement Account
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="bankName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Bank Name
                </label>
                <input
                  {...register("bankName")}
                  type="text"
                  id="bankName"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {errors.bankName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.bankName.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="accountNumber"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Account Number
                </label>
                <input
                  {...register("accountNumber")}
                  type="text"
                  id="accountNumber"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {errors.accountNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.accountNumber.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="accountName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Account name
                </label>
                <input
                  {...register("accountName")}
                  type="text"
                  id="accountName"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {errors.accountName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.accountName.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Virtual Account Payment Gateway */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Virtual Account Payment Gateway
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <div className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                  Guaranteed Trust Bank
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <div className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                  0011223344
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account name
                </label>
                <div className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                  GreenSprings Private School
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Updating..." : "Update Account"}
          </button>
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-2.5 text-gray-700 hover:text-gray-900 transition-colors"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
