"use client";

import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { AddStudentFormData, addStudentSchema } from "@/lib/validations";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddStudentModal({ isOpen, onClose }: AddStudentModalProps) {
  const [step, setStep] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    reset,
  } = useForm<AddStudentFormData>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      studentName: "",
      dateOfBirth: "",
      gender: "male",
      class: "",
      relationship: "parents",
      fatherName: "",
      fatherEmail: "",
      fatherPhone: "",
      fatherAddress: "",
      motherName: "",
      motherEmail: "",
      motherPhone: "",
      motherAddress: "",
    },
  });

  const gender = watch("gender");
  const relationship = watch("relationship");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = async () => {
    const isValid = await trigger([
      "studentName",
      "dateOfBirth",
      "gender",
      "class",
    ]);
    if (isValid) {
      console.log("[v0] Step 1 Data:", {
        studentName: watch("studentName"),
        dateOfBirth: watch("dateOfBirth"),
        gender: watch("gender"),
        class: watch("class"),
        studentPicture: imageFile?.name || "No file selected",
      });
      setStep(2);
    }
  };

  const onSubmit = (data: AddStudentFormData) => {
    const completeFormData = {
      ...data,
      studentPicture: imageFile?.name || "No file selected",
      imagePreview: imagePreview,
    };
    console.log("[v0] Complete Form Data:", completeFormData);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
      setStep(1);
      setImagePreview(null);
      setImageFile(null);
      reset();
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl! w-full">
        <DialogHeader className="flex flex-row items-center justify-between pb-6">
          <DialogTitle>
            {showSuccess ? "Student Added Successfully!" : "Add Student"}
          </DialogTitle>
          {!showSuccess && (
            <DialogClose className="text-gray-400 hover:text-gray-600" />
          )}
        </DialogHeader>

        {showSuccess ? (
          <div className="py-12 text-center">
            <div className="mb-4 text-5xl">✓</div>
            <p className="text-gray-700">
              Student has been successfully added to the system.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* ... existing step indicator ... */}
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-center gap-4 mb-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    step >= 1
                      ? "bg-purple-600 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  1
                </div>
                <div className="flex-1 h-1 bg-gray-300"></div>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    step >= 2
                      ? "bg-purple-600 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  2
                </div>
              </div>
              <div className="flex justify-between text-xs">
                <span
                  className={
                    step === 1 ? "text-purple-600 font-medium" : "text-gray-600"
                  }
                >
                  Basic Information
                </span>
                <span
                  className={
                    step === 2 ? "text-purple-600 font-medium" : "text-gray-600"
                  }
                >
                  Parents/Guardians Information
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              {step === 1 ? (
                <div className="space-y-6">
                  {/* Student Picture */}
                  <div>
                    <label className="text-sm font-medium text-gray-900 block mb-3">
                      Student Picture
                    </label>
                    <div className="flex gap-6">
                      <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center shrink-0">
                        {imagePreview ? (
                          <img
                            src={imagePreview || "/placeholder.svg"}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex flex-col justify-center">
                        <p className="text-sm text-gray-600 mb-3">
                          Please upload image, size less than 100KB
                        </p>
                        <label className="inline-block">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <span className="px-4 py-2 border-2 border-purple-200 text-purple-600 rounded-lg cursor-pointer inline-block hover:bg-purple-50 transition-colors">
                            Choose File
                          </span>
                        </label>
                        <p className="text-sm text-gray-600 mt-2">
                          {imagePreview ? "Image selected" : "No File Chosen"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Student Name */}
                  <div>
                    <label className="text-sm font-medium text-gray-900 block mb-2">
                      Student Name
                    </label>
                    <div className="relative">
                      <svg
                        className="absolute left-3 top-3 w-5 h-5 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12a3 3 0 100-6 3 3 0 000 6z" />
                        <path
                          fillRule="evenodd"
                          d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 2a8 8 0 100 16 8 8 0 000-16z"
                        />
                      </svg>
                      <input
                        type="text"
                        placeholder="School Type"
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.studentName
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        {...register("studentName")}
                      />
                    </div>
                    {errors.studentName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.studentName.message}
                      </p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="text-sm font-medium text-gray-900 block mb-2">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <svg
                        className="absolute left-3 top-3 w-5 h-5 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 2a1 1 0 000 2h12a1 1 0 100-2H6zM4 7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" />
                      </svg>
                      <input
                        type="date"
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.dateOfBirth
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        {...register("dateOfBirth")}
                      />
                    </div>
                    {errors.dateOfBirth && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.dateOfBirth.message}
                      </p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="text-sm font-medium text-gray-900 block mb-3">
                      Gender
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="male"
                          {...register("gender")}
                          className="w-4 h-4"
                        />
                        <span className="text-gray-700">Male</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="female"
                          {...register("gender")}
                          className="w-4 h-4"
                        />
                        <span className="text-gray-700">Female</span>
                      </label>
                    </div>
                    {errors.gender && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.gender.message}
                      </p>
                    )}
                  </div>

                  {/* Class */}
                  <div>
                    <label className="text-sm font-medium text-gray-900 block mb-2">
                      Class
                    </label>
                    <div className="relative">
                      <svg
                        className="absolute left-3 top-3 w-5 h-5 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" />
                      </svg>
                      <select
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none ${
                          errors.class ? "border-red-500" : "border-gray-300"
                        }`}
                        {...register("class")}
                      >
                        <option value="">Select Class</option>
                        <option value="nursery-1">Nursery 1</option>
                        <option value="nursery-2">Nursery 2</option>
                        <option value="jss-1">JSS 1</option>
                        <option value="jss-2">JSS 2</option>
                        <option value="jss-3">JSS 3</option>
                        <option value="sss-1">SSS 1</option>
                        <option value="sss-2">SSS 2</option>
                        <option value="sss-3">SSS 3</option>
                      </select>
                    </div>
                    {errors.class && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.class.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Save, Proceed
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Relationship */}
                  <div>
                    <label className="text-sm font-medium text-gray-900 block mb-3">
                      Relationship to Student
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="parents"
                          {...register("relationship")}
                          className="w-4 h-4"
                        />
                        <span className="text-gray-700">Parents</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="guardian"
                          {...register("relationship")}
                          className="w-4 h-4"
                        />
                        <span className="text-gray-700">Guardian</span>
                      </label>
                    </div>
                    {errors.relationship && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.relationship.message}
                      </p>
                    )}
                  </div>

                  {/* Father/Guardian Name */}
                  <div>
                    <label className="text-sm font-medium text-gray-900 block mb-2">
                      Father/Guardian Name
                    </label>
                    <div className="relative">
                      <svg
                        className="absolute left-3 top-3 w-5 h-5 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12a3 3 0 100-6 3 3 0 000 6z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Name"
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.fatherName
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        {...register("fatherName")}
                      />
                    </div>
                    {errors.fatherName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.fatherName.message}
                      </p>
                    )}
                  </div>

                  {/* Father Email */}
                  <div>
                    <label className="text-sm font-medium text-gray-900 block mb-2">
                      Email address
                    </label>
                    <div className="relative">
                      <svg
                        className="absolute left-3 top-3 w-5 h-5 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                      </svg>
                      <input
                        type="email"
                        placeholder="NarayanMurthy@gmail.com"
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.fatherEmail
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        {...register("fatherEmail")}
                      />
                    </div>
                    {errors.fatherEmail && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.fatherEmail.message}
                      </p>
                    )}
                  </div>

                  {/* Father Phone */}
                  <div>
                    <label className="text-sm font-medium text-gray-900 block mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <svg
                        className="absolute left-3 top-3 w-5 h-5 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                      </svg>
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.fatherPhone
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        {...register("fatherPhone")}
                      />
                    </div>
                    {errors.fatherPhone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.fatherPhone.message}
                      </p>
                    )}
                  </div>

                  {/* Father Address */}
                  <div>
                    <label className="text-sm font-medium text-gray-900 block mb-2">
                      House Address
                    </label>
                    <div className="relative">
                      <svg
                        className="absolute left-3 top-3 w-5 h-5 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="House Address"
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.fatherAddress
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        {...register("fatherAddress")}
                      />
                    </div>
                    {errors.fatherAddress && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.fatherAddress.message}
                      </p>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    {/* Mother/Guardian Name */}
                    <div className="mb-6">
                      <label className="text-sm font-medium text-gray-900 block mb-2">
                        Mother/Guardian Name
                      </label>
                      <div className="relative">
                        <svg
                          className="absolute left-3 top-3 w-5 h-5 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 12a3 3 0 100-6 3 3 0 000 6z" />
                        </svg>
                        <input
                          type="text"
                          placeholder="Name"
                          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            errors.motherName
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          {...register("motherName")}
                        />
                      </div>
                      {errors.motherName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.motherName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Submit
                  </button>
                </div>
              )}
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
