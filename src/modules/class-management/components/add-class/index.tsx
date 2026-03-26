"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { classFormSchema, type ClassFormData } from "@/lib/validations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronDownIcon } from "@/icon/dashbaord/class";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { ClassItem } from "@/@types/class";
import {
  useCreateClassMutation,
  useUpdateClassMutation,
} from "@/redux/api/class";
import { showerror, showsuccess } from "@/utils/toast";

interface AddClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: ClassItem | null;
}

const LEVELS = [
  "Pre Nusery",
  "Junior Secondary 1",
  "Junior Secondary 2",
  "Junior Secondary 3",
  "Senior Secondary 1",
  "Senior Secondary 2",
  "Senior Secondary 3",
];
const CLASS_TYPES = ["NATIVE", "VOCATIONAL"];
const SUB_CLASSES = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

export function AddClassModal({
  open,
  onOpenChange,
  initialData,
}: AddClassModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: "",
      level: "",
      classType: "",
      description: "",
      subClass: "",
    },
  });

  const [createClasses, { isLoading: isCreateClassLoading }] =
    useCreateClassMutation();
  const [updateClass, { isLoading: isUpdateLoading }] =
    useUpdateClassMutation();

  useEffect(() => {
    if (initialData && open) {
      reset({
        name: initialData.name,
        level: initialData.level,
        classType: initialData.classType,
        description: initialData.description || "",
        subClass: initialData.subClass || "",
      });
    } else if (open) {
      reset({
        name: "",
        level: "",
        classType: "",
        description: "",
        subClass: "",
      });
    }
  }, [initialData, reset, open]);

  const onFormSubmit = async (data: ClassFormData) => {
    try {
      if (initialData) {
        const res = await updateClass({ id: initialData._id, ...data }).unwrap();
        showsuccess(res?.message || "Class updated successfully");
      } else {
        const res = await createClasses(data).unwrap();
        showsuccess(res?.message || "Class created successfully");
      }
      onOpenChange(false);
      reset();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error?.data?.message[0], "class erroro");
      showerror(
        Array.isArray(error?.data?.message)
          ? error?.data?.message[0]
          : error?.data?.message,
      );
    }
  };

  const isPending = isCreateClassLoading || isUpdateLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-3xl! bg-white p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            {initialData ? "Edit Class" : "Add Class"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Class Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class Name
            </label>
            <input
              type="text"
              placeholder="e.g., JSS 1"
              {...register("name")}
              className={cn(
                "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors",
                errors.name ? "border-red-500" : "border-gray-300",
              )}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Level
            </label>
            <div className="relative">
              <select
                {...register("level")}
                className={cn(
                  "w-full px-4 py-2 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-white",
                  errors.level ? "border-red-500" : "border-gray-300",
                )}
              >
                <option value="">Select Level</option>
                {LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {errors.level && (
              <p className="text-red-500 text-xs mt-1">
                {errors.level.message}
              </p>
            )}
          </div>

          {/* Class Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class Type
            </label>
            <div className="relative">
              <select
                {...register("classType")}
                className={cn(
                  "w-full px-4 py-2 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-white",
                  errors.classType ? "border-red-500" : "border-gray-300",
                )}
              >
                <option value="">Select Class Type</option>
                {CLASS_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {errors.classType && (
              <p className="text-red-500 text-xs mt-1">
                {errors.classType.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              {...register("description")}
              rows={4}
              placeholder="Enter class description..."
              className={cn(
                "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors resize-none",
                errors.description ? "border-red-500" : "border-gray-300",
              )}
            />
          </div>

          {/* SubClass */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SubClass (optional)
            </label>
            <div className="relative">
              <select
                {...register("subClass")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-white"
              >
                <option value="">Select SubClass</option>
                {SUB_CLASSES.map((subClass) => (
                  <option key={subClass} value={subClass}>
                    {subClass}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="px-8 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending
                ? initialData
                  ? "Updating..."
                  : "Creating..."
                : initialData
                  ? "Update Class"
                  : "Create Class"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
