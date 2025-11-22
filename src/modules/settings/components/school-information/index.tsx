"use client";

import type React from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schoolInfoSchema, type SchoolInfoFormData } from "@/lib/validations";
import { useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon } from "@/icon/dashbaord";

export function SchoolInformationTab() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SchoolInfoFormData>({
    resolver: zodResolver(schoolInfoSchema),
    defaultValues: {
      schoolName: "Greensprings Secondary School",
      phoneNumber: "0809 648 6382",
      schoolType: "private-secondary",
      address: "123 Education Road, Ikeja, Lagos",
      contactEmail: "info@greensprings.edu.ng",
      website: "www.greensprings.edu.ng",
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("[v0] Logo uploaded:", file.name);
    } catch (error) {
      console.error("[v0] Upload error:", error);
      alert("Failed to upload logo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = async (data: SchoolInfoFormData) => {
    console.log(" Form submitted:", data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          School Logo
        </label>
        <div
          onClick={handleUploadClick}
          className="w-28 h-28 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors overflow-hidden bg-gray-50 hover:bg-gray-100"
        >
          {logoPreview ? (
            <Image
              src={logoPreview || "/placeholder.svg"}
              alt="Logo preview"
              width={112}
              height={112}
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-xs text-gray-500 text-center px-2">
                {isUploading ? "Uploading..." : "Upload your photo"}
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
          disabled={isUploading}
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
              <option value="private-primary">Private Primary School</option>
              <option value="private-secondary">
                Private Secondary School
              </option>
              <option value="public-primary">Public Primary School</option>
              <option value="public-secondary">Public Secondary School</option>
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

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Updating..." : "Update Profile"}
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
