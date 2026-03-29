"use client";

import type React from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schoolInfoSchema, type SchoolInfoFormData } from "@/lib/validations";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon } from "@/icon/dashbaord";
import { showerror, showsuccess } from "@/utils/toast";
import {
  useGetShoolProfileQuery,
  useUpdateSchoolMutation,
} from "@/redux/api/school";
import { useUploadFileMutation } from "@/redux/api/file";
import { UpdateSchoolRequest } from "@/@types/school";
import { usePermission } from "@/utils/permissions";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";

export function SchoolInformationTab() {
  const { isStaff } = usePermission();
  const { data: SchoolProfile, isFetching: isFetchingSchoolProfile } =
    useGetShoolProfileQuery();
  const [updateSchool, { isLoading: isUpdatingSchool }] =
    useUpdateSchoolMutation();
  const [uploadFile, { isLoading: isUploadingFile }] = useUploadFileMutation();

  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SchoolInfoFormData>({
    resolver: zodResolver(schoolInfoSchema),
    defaultValues: {
      schoolName: SchoolProfile?.data.name || "",
      phoneNumber: SchoolProfile?.data.contactPhone || "",
      schoolType: SchoolProfile?.data.schoolType || "",
      address: SchoolProfile?.data.address || "",
      contactEmail: SchoolProfile?.data.contactEmail || "",
      website: SchoolProfile?.data.website || "",
    },
  });

  useEffect(() => {
    if (SchoolProfile) {
      reset({
        schoolName: SchoolProfile.data.name || "",
        phoneNumber: SchoolProfile.data.contactPhone || "",
        schoolType: SchoolProfile.data.schoolType || "",
        address: SchoolProfile.data.address || "",
        contactEmail: SchoolProfile.data.contactEmail || "",
        website: SchoolProfile.data.website || "",
      });
      if (
        SchoolProfile.data.logoUrl &&
        typeof SchoolProfile.data.logoUrl === "object"
      ) {
        setUploadedLogo(SchoolProfile.data._id);
      }
    }
  }, [SchoolProfile, reset]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      showerror("No file selected");
      return;
    }

    if (!file.type.startsWith("image/")) {
      showerror("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showerror("File size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setLogoPreview(base64String);

      try {
        const payload = {
          fileBase64: base64String,
          folder: "school-logos",
          originalName: file.name,
          mimeType: file.type,
          description: "School logo upload",
        };

        const response = await uploadFile(payload).unwrap();
        setUploadedLogo(response.data._id);
        showsuccess(response?.message || "Logo uploaded successfully");
      } catch (error: any) {
        showerror(error?.data?.message || "Failed to upload logo");
        setLogoPreview(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    if (isStaff) return;
    fileInputRef.current?.click();
  };

  const onSubmit = async (data: SchoolInfoFormData) => {
    try {
      const payload: UpdateSchoolRequest = {
        name: data.schoolName,
        address: data.address,
        contactEmail: data.contactEmail,
        contactName: SchoolProfile?.data?.contactName,
        contactPhone: data.phoneNumber,
        schoolType: data.schoolType as "Private" | "Public",
        website: data.website,
        ...(uploadedLogo && { logoUrl: uploadedLogo }),
      };

      await updateSchool(payload).unwrap();
      showsuccess("School profile updated successfully");
    } catch (error: any) {
      showerror(error?.data?.message || "Failed to update school profile");
    }
  };

  if (isFetchingSchoolProfile) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          School Logo
        </label>
        <div
          onClick={handleUploadClick}
          className={cn(
            "w-28 h-28 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center overflow-hidden bg-gray-50 transition-colors",
            !isStaff && "cursor-pointer hover:border-gray-400 hover:bg-gray-100"
          )}
        >
          {isUploadingFile ? (
            <div className="flex flex-col items-center">
              <Loader className="w-6 h-6 animate-spin text-purple-600 mb-1" />
              <span className="text-[10px] text-gray-500">Uploading...</span>
            </div>
          ) : logoPreview ||
            (typeof SchoolProfile?.data?.logoUrl === "object" &&
              SchoolProfile?.data?.logoUrl?.url) ||
            (typeof SchoolProfile?.data?.logoUrl === "string" &&
              SchoolProfile?.data?.logoUrl) ? (
            <Image
              src={
                logoPreview ||
                (typeof SchoolProfile?.data?.logoUrl === "object"
                  ? SchoolProfile?.data?.logoUrl?.url
                  : SchoolProfile?.data?.logoUrl) ||
                "/placeholder.svg"
              }
              alt="Logo"
              width={112}
              height={112}
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-xs text-gray-500 text-center px-2">
                Upload your photo
              </span>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploadingFile}
        />
      </div>

      <div className="h-px bg-gray-200"></div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="schoolName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              School Name
            </label>
            <input
              {...register("schoolName")}
              type="text"
              id="schoolName"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Greensprings Secondary School"
            />
            {errors.schoolName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.schoolName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Phone Number
            </label>
            <input
              {...register("phoneNumber")}
              type="tel"
              id="phoneNumber"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0809 648 6382"
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="schoolType"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              School Type
            </label>
            <select
              {...register("schoolType")}
              id="schoolType"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">Select school type</option>
              <option value="Private">Private </option>
              <option value="Public">Public</option>
            </select>
            {errors.schoolType && (
              <p className="mt-1 text-sm text-red-600">
                {errors.schoolType.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Address
            </label>
            <input
              {...register("address")}
              type="text"
              id="address"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="123 Education Road, Ikeja, Lagos"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">
                {errors.address.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="contactEmail"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Contact Email
            </label>
            <input
              {...register("contactEmail")}
              type="email"
              id="contactEmail"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="info@greensprings.edu.ng"
            />
            {errors.contactEmail && (
              <p className="mt-1 text-sm text-red-600">
                {errors.contactEmail.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="website"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Website
            </label>
            <input
              {...register("website")}
              type="text"
              id="website"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="www.greensprings.edu.ng"
            />
            {errors.website && (
              <p className="mt-1 text-sm text-red-600">
                {errors.website.message}
              </p>
            )}
          </div>
        </div>

        {!isStaff && (
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isUpdatingSchool || isUploadingFile}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUpdatingSchool && <Loader className="w-4 h-4 animate-spin" />}
              {isUpdatingSchool ? "Updating..." : "Update Profile"}
            </button>
            <button
              type="button"
              onClick={() => reset()}
              className="px-6 py-2.5 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Reset
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
