"use client";

import type React from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useRef } from "react";
import {
  paymentSettingsSchema,
  type PaymentSettingsFormData,
} from "@/lib/validations";
import { Trash2, X, Loader2, CheckCircle2 } from "lucide-react";
import {
  useGetBanksQuery,
  useValidateAccountMutation,
  useCreateSettlementAccountMutation,
} from "@/redux/api/transaction";
import { useGetShoolProfileQuery } from "@/redux/api/school";
import { useEffect } from "react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";

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
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
    control,
  } = useForm<PaymentSettingsFormData>({
    resolver: zodResolver(paymentSettingsSchema),
  });

  const { data: schoolProfile } = useGetShoolProfileQuery();
  const { data: banksData, isLoading: isLoadingBanks } = useGetBanksQuery();
  const [validateAccount, { isLoading: isValidating }] =
    useValidateAccountMutation();
  const [createSettlementAccount] = useCreateSettlementAccountMutation();

  const watchBankCode = watch("bankCode");
  const watchAccountNumber = watch("accountNumber");
  const debouncedAccountNumber = useDebounce(watchAccountNumber, 3000);

  useEffect(() => {
    const validate = async () => {
      if (watchBankCode && debouncedAccountNumber?.length === 10) {
        try {
          const res = await validateAccount({
            bankCode: watchBankCode,
            accountNumber: debouncedAccountNumber,
          }).unwrap();
          if (res.success) {
            setValue("accountName", res.data.account_name);
            const selectedBank = banksData?.data.find(
              (b) => b.code === watchBankCode,
            );
            if (selectedBank) {
              setValue("bankName", selectedBank.name);
            }
          }
        } catch (error) {
          console.error("Account validation failed", error);
        }
      }
    };
    validate();
  }, [
    watchBankCode,
    debouncedAccountNumber,
    validateAccount,
    setValue,
    banksData,
  ]);

  const [cacFile, setCacFile] = useState<File | null>(null);
  const [memarrtFile, setMemarrtFile] = useState<File | null>(null);
  const [isSubmittingDocuments, setIsSubmittingDocuments] = useState(false);
  const [isAccountVerifying, setIsAccountVerifying] = useState(false);
  const [virtualAccountDetails, setVirtualAccountDetails] =
    useState<VirtualAccountDetails | null>(null);
  const cacInputRef = useRef<HTMLInputElement>(null);
  const memarrtInputRef = useRef<HTMLInputElement>(null);

  const onSettlementSubmit = async (data: PaymentSettingsFormData) => {
    if (!schoolProfile?.data?._id) {
      toast.error("School information not found");
      return;
    }

    try {
      const res = await createSettlementAccount({
        school: schoolProfile.data._id,
        bankName: data.bankName,
        accountName: data.accountName,
        accountNumber: data.accountNumber,
        isPrimary: true,
      }).unwrap();
      toast.success(res.message);
      reset();
    } catch (error: any) {
      toast.error(error.message);
      console.error(error);
    }
  };

  const handleRemoveFile = (fileType: "cac" | "memarrt") => {
    if (fileType === "cac") {
      setCacFile(null);
      if (cacInputRef.current) cacInputRef.current.value = "";
    } else {
      setMemarrtFile(null);
      if (memarrtInputRef.current) memarrtInputRef.current.value = "";
    }
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType: "cac" | "memarrt",
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
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (!cacFile || !memarrtFile) {
      alert("Please upload both documents");
      return;
    }

    setIsSubmittingDocuments(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsAccountVerifying(true);
    setVirtualAccountDetails(null);

    setIsSubmittingDocuments(false);
  };

  const hasSubmittedDocuments =
    isAccountVerifying || virtualAccountDetails !== null;

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
                    htmlFor="bankCode"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Bank Name
                  </label>
                  <select
                    {...register("bankCode")}
                    id="bankCode"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select a bank</option>
                    {banksData?.data.map((bank) => (
                      <option key={bank.code} value={bank.code}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                  {errors.bankCode && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.bankCode.message}
                    </p>
                  )}
                </div>

                <div className="relative">
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
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {isValidating && (
                    <div className="absolute right-3 top-10">
                      <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                    </div>
                  )}
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
                    Account Name
                  </label>
                  <div className="relative">
                    <input
                      {...register("accountName")}
                      type="text"
                      id="accountName"
                      readOnly
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none cursor-not-allowed"
                    />
                    {watch("accountName") &&
                      !errors.accountName &&
                      !isValidating && (
                        <div className="absolute right-3 top-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </div>
                      )}
                  </div>
                  {errors.accountName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.accountName.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* PTA Account Section */}
            {/* <div>
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
                    // {...register("accountNumber")}
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
            </div> */}

            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
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
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-purple-600">
                              {cacFile.name}
                            </p>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile("cac")}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Remove file"
                            >
                              <X size={16} />
                            </button>
                          </div>
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
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-purple-600">
                              {memarrtFile.name}
                            </p>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile("memarrt")}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Remove file"
                            >
                              <X size={16} />
                            </button>
                          </div>
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
                  <div className="flex items-center justify-between group">
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        CAC Certificate
                      </p>
                      <span className="text-purple-600 text-sm italic">
                        {cacFile?.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountVerifying(false);
                        setVirtualAccountDetails(null);
                        setCacFile(null);
                        setMemarrtFile(null);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete and re-upload"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Memorandum and Articles of Association (MEMMART)
                    </p>
                    <span className="text-purple-600 text-sm italic">
                      {memarrtFile?.name}
                    </span>
                  </div>
                </div>

                {/* Account Details or Verification Status */}
                {isAccountVerifying ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex flex-col items-center text-center space-y-3">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-blue-700 font-semibold italic">
                      Verifying document. Check back in 24 hours
                    </p>
                  </div>
                ) : (
                  virtualAccountDetails && (
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
                  )
                )}
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
