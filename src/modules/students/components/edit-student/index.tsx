/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useGetStudentByIdQuery, useUpdateStudentMutation } from "@/redux/api/student";
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
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { ClassItem } from "@/@types/class";

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string | null;
  classItems: ClassItem[];
  isClassesLoading: boolean;
}

export function EditStudentModal({
  isOpen,
  onClose,
  studentId,
  classItems,
  isClassesLoading,
}: EditStudentModalProps) {
  const [step, setStep] = useState(1);

  const { data: studentData, isFetching: isFetchingStudent } = useGetStudentByIdQuery(
    studentId as string,
    { skip: !studentId || !isOpen }
  );

  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();

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

  // Prefill the form when student details are loaded
  useEffect(() => {
    if (studentData && isOpen) {
      const student = studentData;
      reset({
        firstName: student.firstName || "",
        lastName: student.lastName || "",
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split("T")[0] : "",
        gender: student.gender || "MALE",
        class: typeof student.class === "object" ? student.class?._id : student.class || "",
        admissionNumber: student.admissionNumber || "",
        parentDetails: student.parentDetails?.map((p: any) => ({
          email: p.email || "",
          firstName: p.firstName || "",
          lastName: p.lastName || "",
          phone: p.phone || "",
          address: p.address || "",
          occupation: p.occupation || "",
          relationship: p.relationship || "PARENT",
          gender: p.gender || "FEMALE",
          title: p.title || "",
        })) || [
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
      setStep(1);
    }
  }, [studentData, reset, isOpen]);

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
    if (!studentId) return;
    try {
      const res = await updateStudent({
        id: studentId,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: toISOStringSafe(data.dateOfBirth),
        gender: data.gender,
        class: data.class,
        admissionNumber: data?.admissionNumber as string,
        parentDetails: data.parentDetails,
        school: studentData?.school || "",
      } as any).unwrap();
      
      showsuccess(res?.message || "Student updated successfully");
      onClose();
    } catch (error: any) {
      showerror(error?.data?.message || "Failed to update student");
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
              <h2 className="text-xl font-bold tracking-tight text-white">
                Edit Student
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Update student details
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
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                Editing Mode
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            <DialogHeader className="p-6 border-b border-gray-100 flex-row justify-between items-center sm:text-left">
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  {isFetchingStudent ? "Loading Student Data..." : "Edit Student Information"}
                </DialogTitle>
                <p className="text-sm text-gray-500 mt-0.5 md:hidden">Step {step} of 2</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600 ml-auto"
              >
                <X size={20} />
              </button>
            </DialogHeader>

            {isFetchingStudent ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12">
                <Loader className="w-8 h-8 text-purple-600 animate-spin mb-3" />
                <span className="text-sm font-semibold text-gray-600">Retrieving student profile...</span>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-8">
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="max-w-2xl mx-auto"
                >
                  {/* Step 1: Basic Information */}
                  {step === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                                : "border-gray-200 focus:border-purple-500 bg-white text-gray-900"
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
                                : "border-gray-200 focus:border-purple-500 bg-white text-gray-900"
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
                            Admission Number
                          </label>
                          <input
                            placeholder="AD/2024/001"
                            {...register("admissionNumber")}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-white outline-none transition-all duration-200 text-gray-900"
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
                                : "border-gray-200 focus:border-purple-500 bg-white uppercase text-xs tracking-wider text-gray-900"
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
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-white outline-none transition-all duration-200 appearance-none text-gray-900 cursor-pointer"
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
                              className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-purple-500/20 appearance-none cursor-pointer ${
                                errors.class
                                  ? "border-red-500 bg-red-50/50"
                                  : "border-gray-200 focus:border-purple-500 bg-white text-gray-900"
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
                        className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-[0_4px_14px_rgba(147,51,234,0.39)] flex items-center justify-center gap-2 group cursor-pointer"
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
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors group/trash cursor-pointer"
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
                                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-white outline-none text-sm transition-all text-gray-900"
                                />
                              </div>

                              <div className="hidden sm:block"></div>

                              {/* First Name */}
                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                  First Name
                                </label>
                                <input
                                  {...register(`parentDetails.${index}.firstName`)}
                                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-white outline-none text-sm transition-all text-gray-900"
                                />
                              </div>

                              {/* Last Name */}
                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                  Last Name
                                </label>
                                <input
                                  {...register(`parentDetails.${index}.lastName`)}
                                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-white outline-none text-sm transition-all text-gray-900"
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
                                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-white outline-none text-sm transition-all text-gray-900"
                                />
                              </div>

                              {/* Phone */}
                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                  <Phone size={12} /> Phone
                                </label>
                                <input
                                  {...register(`parentDetails.${index}.phone`)}
                                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-white outline-none text-sm transition-all text-gray-900"
                                />
                              </div>

                              {/* Address */}
                              <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                  <MapPin size={12} /> Address
                                </label>
                                <input
                                  {...register(`parentDetails.${index}.address`)}
                                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-white outline-none text-sm transition-all text-gray-900"
                                />
                              </div>

                              {/* Occupation */}
                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                  <Briefcase size={12} /> Occupation
                                </label>
                                <input
                                  {...register(`parentDetails.${index}.occupation`)}
                                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-white outline-none text-sm transition-all text-gray-900"
                                />
                              </div>

                              {/* Relationship */}
                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                  Relationship
                                </label>
                                <select
                                  {...register(`parentDetails.${index}.relationship`)}
                                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-white outline-none text-sm transition-all appearance-none text-gray-900 cursor-pointer"
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
                        className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 font-semibold hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/50 transition-all flex items-center justify-center gap-2 group cursor-pointer"
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
                          className="flex-1 py-4 px-6 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <ChevronLeft size={20} />
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={isUpdating}
                          className="flex-[2] py-4 px-6 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg hover:shadow-purple-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {isUpdating ? (
                            <Loader className="animate-spin" size={20} />
                          ) : (
                            <>
                              Save Changes
                              <Plus size={20} />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
