"use client";

import type React from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useRef } from "react";
import {
  paymentSettingsSchema,
  type PaymentSettingsFormData,
} from "@/lib/validations";

interface VirtualAccountDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export function PaymentSettingsTab() {
  // Settlement and PTA Account Forms
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PaymentSettingsFormData>({
    resolver: zodResolver(paymentSettingsSchema),
  });

  const [cacFile, setCacFile] = useState<File | null>(null);
  const [memarrtFile, setMemarrtFile] = useState<File | null>(null);
  const [isSubmittingDocuments, setIsSubmittingDocuments] = useState(false);
  const [virtualAccountDetails, setVirtualAccountDetails] =
    useState<VirtualAccountDetails | null>(null);
  const cacInputRef = useRef<HTMLInputElement>(null);
  const memarrtInputRef = useRef<HTMLInputElement>(null);

  const onSettlementSubmit = async (data: PaymentSettingsFormData) => {
    console.log("[v0] Payment settings submitted:", data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType: "cac" | "memarrt"
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (fileType === "cac") {
        setCacFile(file);
      } else {
        setMemarrtFile(file);
      }
    }
  };

  const handleVirtualAccountSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!cacFile || !memarrtFile) {
      alert("Please upload both documents");
      return;
    }

    setIsSubmittingDocuments(true);

    // Log uploaded files and values
    console.log("[v0] Virtual Account Submission:", {
      cacFile: {
        name: cacFile.name,
        size: cacFile.size,
        type: cacFile.type,
      },
      memarrtFile: {
        name: memarrtFile.name,
        size: memarrtFile.size,
        type: memarrtFile.type,
      },
      timestamp: new Date().toISOString(),
    });

    // Simulate API call - remove loading state once API is integrated
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Display virtual account details
    setVirtualAccountDetails({
      bankName: "Guaranteed Trust Bank",
      accountNumber: "0011223344",
      accountName: "Sanctum Startup College",
    });

    setIsSubmittingDocuments(false);
  };

  const hasSubmittedDocuments = virtualAccountDetails !== null;

  return (
    <div className="max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Settlement Accounts */}
        <div className="lg:col-span-1 space-y-6">
          <form
            onSubmit={handleSubmit(onSettlementSubmit)}
            className="space-y-6"
          >
            {/* School Account Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                School Account
              </h3>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="bankName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    BVN
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
                    Bank Name
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
                    Account Number
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

            {/* PTA Account Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                PTA Account
              </h3>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="ptaBankName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Bank Name
                  </label>
                  <input
                    {...register("bankName")}
                    type="text"
                    id="ptaBankName"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="ptaAccountNumber"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Account Number
                  </label>
                  <input
                    {...register("accountNumber")}
                    type="text"
                    id="ptaAccountNumber"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="ptaAccountName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Account name
                  </label>
                  <input
                    {...register("accountName")}
                    type="text"
                    id="ptaAccountName"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm font-medium"
              >
                {isSubmitting ? "Updating..." : "Update Account"}
              </button>
              <button
                type="button"
                onClick={() => reset()}
                className="px-6 py-2.5 text-gray-700 hover:text-gray-900 transition-colors text-sm"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Virtual Account Payment Gateway */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Virtual Account Payment Gateway
          </h3>

          <form onSubmit={handleVirtualAccountSubmit} className="space-y-6">
            {!hasSubmittedDocuments ? (
              <>
                {/* Document Upload Section */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 space-y-6">
                  <p className="text-sm text-gray-700 font-medium">
                    To complete your account Setup, Please upload:
                  </p>

                  {/* CAC Certificate Upload */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-purple-300 text-purple-600 font-semibold text-sm flex-shrink-0">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Upload <span className="italic">CAC Certificate</span>
                        </p>
                        {cacFile && (
                          <p className="text-sm text-purple-600 mt-1">
                            {cacFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="ml-12">
                      <input
                        ref={cacInputRef}
                        type="file"
                        onChange={(e) => handleFileChange(e, "cac")}
                        disabled={hasSubmittedDocuments}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => cacInputRef.current?.click()}
                        disabled={hasSubmittedDocuments}
                        className="px-4 py-2 border-2 border-dashed border-purple-300 text-purple-600 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Click to Upload
                      </button>
                    </div>
                  </div>

                  {/* MEMMART Upload */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-purple-300 text-purple-600 font-semibold text-sm flex-shrink-0">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Upload{" "}
                          <span className="italic">
                            Memorandum and Articles of Association (MEMMART)
                          </span>
                        </p>
                        {memarrtFile && (
                          <p className="text-sm text-purple-600 mt-1">
                            {memarrtFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="ml-12">
                      <input
                        ref={memarrtInputRef}
                        type="file"
                        onChange={(e) => handleFileChange(e, "memarrt")}
                        disabled={hasSubmittedDocuments}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => memarrtInputRef.current?.click()}
                        disabled={hasSubmittedDocuments}
                        className="px-4 py-2 border-2 border-dashed border-purple-300 text-purple-600 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Click to Upload
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmittingDocuments || !cacFile || !memarrtFile}
                  className="w-full px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingDocuments ? "Processing..." : "Submit"}
                </button>
              </>
            ) : (
              <>
                {/* Submitted Documents Display */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      Upload <span className="italic">CAC Certificate</span>
                    </p>
                    <a
                      href="#"
                      className="text-purple-600 hover:text-purple-700 text-sm underline"
                    >
                      {cacFile?.name}
                    </a>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      <span className="italic">
                        Memorandum and Articles of Association (MEMMART)
                      </span>
                    </p>
                    <a
                      href="#"
                      className="text-purple-600 hover:text-purple-700 text-sm underline"
                    >
                      {memarrtFile?.name}
                    </a>
                  </div>
                </div>

                {/* Virtual Account Details */}
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name
                    </label>
                    <div className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium">
                      {virtualAccountDetails.bankName}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number
                    </label>
                    <div className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium">
                      {virtualAccountDetails.accountNumber}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account name
                    </label>
                    <div className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium">
                      {virtualAccountDetails.accountName}
                    </div>
                  </div>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
