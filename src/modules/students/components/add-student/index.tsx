/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useCreateStudentMutation } from "@/redux/api/student";
import { AddStudentFormData, addStudentSchema } from "@/lib/validations";
import { showerror, showsuccess } from "@/utils/toast";
import { toISOStringSafe } from "@/utils/functions";
import {
  Loader,
  User,
  Calendar,
  Users,
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Heart,
  ChevronRight,
  ChevronLeft,
  Upload,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { ClassItem } from "@/@types/class";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classItems: ClassItem[];
  isClassesLoading: boolean;
  onCloseModal: () => void;
}

export function AddStudentModal({
  isOpen,
  onClose,
  classItems,
  isClassesLoading,
  onCloseModal,
}: AddStudentModalProps) {
  const [step, setStep] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { currentUser } = useSelector((state: RootState) => state.authState);

  const [createStudent, { isLoading }] = useCreateStudentMutation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    trigger,
    reset,
  } = useForm<AddStudentFormData>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "MALE",
      class: "",
      admissionNumber: "",
      parentDetails: [
        {
          email: "",
          firstName: "",
          lastName: "",
          phone: "",
          address: "",
          occupation: "",
          relationship: "PARENT",
          gender: "FEMALE",
          title: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "parentDetails",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleNext = async () => {
    const isValid = await trigger([
      "firstName",
      "lastName",
      "dateOfBirth",
      "gender",
      "class",
    ]);
    if (isValid) setStep(2);
  };

  const onSubmit = async (data: AddStudentFormData) => {
    try {
      const res = await createStudent({
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: toISOStringSafe(data.dateOfBirth),
        gender: data.gender,
        class: data.class,
        admissionNumber: data?.admissionNumber as string,
        parentDetails: data.parentDetails,
        school: currentUser?.schoolId as string,
      }).unwrap();
      showsuccess(res?.message);
      onClose();
      onCloseModal();
      reset({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "MALE",
        class: "",
        admissionNumber: "",
        parentDetails: [
          {
            email: "",
            firstName: "",
            lastName: "",
            phone: "",
            address: "",
            occupation: "",
            relationship: "PARENT",
            gender: "FEMALE",
            title: "",
          },
        ],
      });
    } catch (error: any) {
      showerror(error?.data?.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="max-w-4xl! w-full p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-gray-50/50 backdrop-blur-sm"
      >
        <div className="flex h-full max-h-[90vh]">
          {/* Sidebar Stepper - Desktop Only */}
          <div className="hidden md:flex flex-col w-64 bg-gray-900 p-8 text-white shrink-0">
            <div className="mb-8">
              <h2 className="text-xl font-bold tracking-tight">
                Add New Student
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Complete the enrollment process
              </p>
            </div>

            <nav className="space-y-6 flex-1">
              {[
                {
                  s: 1,
                  title: "Basic Information",
                  desc: "Personal & Academic",
                  icon: User,
                },
                {
                  s: 2,
                  title: "Parents/Guardians",
                  desc: "Contact Details",
                  icon: Heart,
                },
              ].map((item) => (
                <div
                  key={item.s}
                  className={`flex items-start gap-4 transition-all duration-300 ${
                    step === item.s ? "opacity-100 translate-x-1" : "opacity-40"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      step >= item.s
                        ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    <item.icon size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{item.title}</span>
                    <span className="text-[11px] text-gray-500 uppercase tracking-wider font-bold">
                      {item.desc}
                    </span>
                  </div>
                </div>
              ))}
            </nav>

            <div className="mt-auto pt-8 border-t border-gray-800">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                System Active
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            <DialogHeader className="p-6 border-b border-gray-100 flex-row justify-between items-center sm:text-left">
              <div className="md:hidden">
                <DialogTitle className="text-xl font-bold">
                  Add Student
                </DialogTitle>
                <p className="text-sm text-gray-500 mt-0.5">Step {step} of 2</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600 ml-auto"
              >
                <X size={20} />
              </button>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-8">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="max-w-2xl mx-auto"
              >
                {/* Step 1: Basic Information */}
                {step === 1 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Student Picture Section */}
                    <div className="flex flex-col sm:flex-row items-center gap-8 bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-200">
                      <div className="relative group">
                        <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center border-2 border-gray-100 shadow-sm overflow-hidden transition-transform group-hover:scale-105 duration-300">
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-1 text-gray-400">
                              <User size={40} strokeWidth={1.5} />
                            </div>
                          )}
                        </div>
                        <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center cursor-pointer shadow-lg hover:bg-purple-700 transition-all hover:scale-110 active:scale-95">
                          <Upload size={18} />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h4 className="font-semibold text-gray-900">
                          Student Portrait
                        </h4>
                        <p className="text-sm text-gray-500 mt-1 max-w-[240px]">
                          Upload a clear photo for identification and records.
                          Max size 2MB.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* First Name */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <User size={16} className="text-purple-500" />
                          First Name
                        </label>
                        <input
                          placeholder="e.g. John"
                          {...register("firstName")}
                          className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-purple-500/20 ${
                            errors.firstName
                              ? "border-red-500 bg-red-50/50"
                              : "border-gray-200 focus:border-purple-500 bg-white"
                          }`}
                        />
                        {errors.firstName && (
                          <p className="text-xs text-red-500 font-medium">
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>

                      {/* Last Name */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <User size={16} className="text-purple-500" />
                          Last Name
                        </label>
                        <input
                          placeholder="e.g. Doe"
                          {...register("lastName")}
                          className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-purple-500/20 ${
                            errors.lastName
                              ? "border-red-500 bg-red-50/50"
                              : "border-gray-200 focus:border-purple-500 bg-white"
                          }`}
                        />
                        {errors.lastName && (
                          <p className="text-xs text-red-500 font-medium">
                            {errors.lastName.message}
                          </p>
                        )}
                      </div>

                      {/* Admission Number */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <BookOpen size={16} className="text-purple-500" />
                          Admission Number{" "}
                          <span className="text-gray-400 font-normal">
                            (Optional)
                          </span>
                        </label>
                        <input
                          placeholder="AD/2024/001"
                          {...register("admissionNumber")}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-white outline-none transition-all duration-200"
                        />
                      </div>

                      {/* Date of Birth */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Calendar size={16} className="text-purple-500" />
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          {...register("dateOfBirth")}
                          className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-purple-500/20 ${
                            errors.dateOfBirth
                              ? "border-red-500 bg-red-50/50"
                              : "border-gray-200 focus:border-purple-500 bg-white uppercase text-xs tracking-wider"
                          }`}
                        />
                        {errors.dateOfBirth && (
                          <p className="text-xs text-red-500 font-medium">
                            {errors.dateOfBirth.message}
                          </p>
                        )}
                      </div>

                      {/* Gender */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Users size={16} className="text-purple-500" />
                          Gender
                        </label>
                        <select
                          {...register("gender")}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-white outline-none transition-all duration-200 appearance-none"
                        >
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                        </select>
                      </div>

                      {/* Class */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <BookOpen size={16} className="text-purple-500" />
                          Assigned Class
                        </label>
                        {isClassesLoading ? (
                          <div className="h-[46px] w-full bg-gray-100 animate-pulse rounded-xl"></div>
                        ) : (
                          <select
                            {...register("class")}
                            className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-purple-500/20 appearance-none ${
                              errors.class
                                ? "border-red-500 bg-red-50/50"
                                : "border-gray-200 focus:border-purple-500 bg-white"
                            }`}
                          >
                            <option value="">Select a class</option>
                            {classItems?.map((classItem) => (
                              <option key={classItem._id} value={classItem._id}>
                                {classItem.name}
                              </option>
                            ))}
                          </select>
                        )}
                        {errors.class && (
                          <p className="text-xs text-red-500 font-medium">
                            Please select a class
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-[0_4px_14px_rgba(147,51,234,0.39)] flex items-center justify-center gap-2 group"
                    >
                      Continue to Parent Details
                      <ChevronRight
                        size={20}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </button>
                  </div>
                )}

                {/* Step 2: Parent Information */}
                {step === 2 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
                    <div className="space-y-6">
                      {fields.map((field, index) => (
                        <div
                          key={field.id}
                          className="relative group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center font-bold text-sm">
                                {index + 1}
                              </div>
                              <h4 className="font-bold text-gray-900">
                                Parent/Guardian Details
                              </h4>
                            </div>
                            {fields.length > 1 && (
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors group/trash"
                                title="Remove Parent"
                              >
                                <Trash2
                                  size={18}
                                  className="group-hover/trash:scale-110 transition-transform"
                                />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Title */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                Title
                              </label>
                              <input
                                {...register(`parentDetails.${index}.title`)}
                                placeholder="e.g. Mr, Mrs, Dr"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-white outline-none text-sm transition-all"
                              />
                            </div>

                            <div className="hidden sm:block"></div>

                            {/* First Name */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                First Name
                              </label>
                              <input
                                {...register(
                                  `parentDetails.${index}.firstName`,
                                )}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-white outline-none text-sm transition-all"
                              />
                            </div>

                            {/* Last Name */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                Last Name
                              </label>
                              <input
                                {...register(`parentDetails.${index}.lastName`)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-white outline-none text-sm transition-all"
                              />
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                <Mail size={12} /> Email
                              </label>
                              <input
                                type="email"
                                {...register(`parentDetails.${index}.email`)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-white outline-none text-sm transition-all"
                              />
                            </div>

                            {/* Phone */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                <Phone size={12} /> Phone
                              </label>
                              <input
                                {...register(`parentDetails.${index}.phone`)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-white outline-none text-sm transition-all"
                              />
                            </div>

                            {/* Address */}
                            <div className="space-y-1.5 sm:col-span-2">
                              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                <MapPin size={12} /> Address
                              </label>
                              <input
                                {...register(`parentDetails.${index}.address`)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-white outline-none text-sm transition-all"
                              />
                            </div>

                            {/* Occupation */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                <Briefcase size={12} /> Occupation
                              </label>
                              <input
                                {...register(
                                  `parentDetails.${index}.occupation`,
                                )}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-white outline-none text-sm transition-all"
                              />
                            </div>

                            {/* Relationship */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                Relationship
                              </label>
                              <select
                                {...register(
                                  `parentDetails.${index}.relationship`,
                                )}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-white outline-none text-sm transition-all appearance-none"
                              >
                                <option value="PARENT">Parent</option>
                                <option value="GUARDIAN">Guardian</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        append({
                          email: "",
                          firstName: "",
                          lastName: "",
                          phone: "",
                          address: "",
                          occupation: "",
                          relationship: "PARENT",
                          gender: "FEMALE",
                          title: "",
                        })
                      }
                      className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 font-semibold hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/50 transition-all flex items-center justify-center gap-2 group"
                    >
                      <Plus
                        size={18}
                        className="group-hover:rotate-90 transition-transform duration-300"
                      />
                      Add Another Parent / Guardian
                    </button>

                    <div className="flex items-center gap-4 pt-4 sticky bottom-0 bg-white border-t border-gray-100 mt-8 pb-4">
                      <button
                        onClick={() => setStep(1)}
                        type="button"
                        className="flex-1 py-4 px-6 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                      >
                        <ChevronLeft size={20} />
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-[2] py-4 px-6 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg hover:shadow-purple-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <Loader className="animate-spin" size={20} />
                        ) : (
                          <>
                            Complete Enrollment
                            <Plus size={20} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
