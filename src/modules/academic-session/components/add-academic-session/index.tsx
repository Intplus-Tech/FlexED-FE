/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Switch } from "@/components/ui/switch";
import {
  useCreateAcademicSessionMutation,
  useUpdateAcademicSessionMutation,
  useUpdateAcademicSessionStatusMutation,
} from "@/redux/api/academicSession";
import { showerror, showsuccess } from "@/utils/toast";
import { Loader } from "lucide-react";
import { SessionData } from "@/@types/academic-session";
import { useEffect } from "react";

const periodFormSchema = z
  .object({
    name: z
      .string()
      .min(1, "Period name is required")
      .min(3, "Period name must be at least 3 characters"),
    startDate: z
      .string()
      .min(1, "Start date is required")
      .refine((date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(date) >= today;
      }, "Start date cannot be in the past"),
    endDate: z.string().min(1, "End date is required"),
    isActive: z.boolean().default(false),
  })
  .refine(
    (data) => {
      return new Date(data.endDate) > new Date(data.startDate);
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

type PeriodFormData = z.infer<typeof periodFormSchema>;

interface AddPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: SessionData | null;
}

export default function AddPeriodModal({
  isOpen,
  onClose,
  initialData,
}: AddPeriodModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm({
    resolver: zodResolver(periodFormSchema),
    defaultValues: {
      isActive: false,
    },
  });

  const [createAcademicSession, { isLoading: createAcademicSessionLoading }] =
    useCreateAcademicSessionMutation();
  const [updateAcademicSession, { isLoading: updateAcademicSessionLoading }] =
    useUpdateAcademicSessionMutation();
  const [updateStatus, { isLoading: statusLoading }] =
    useUpdateAcademicSessionStatusMutation();

  useEffect(() => {
    if (initialData && isOpen) {
      reset({
        name: initialData.name,
        startDate: initialData.startDate?.split("T")[0],
        endDate: initialData.endDate?.split("T")[0],
        isActive: initialData.isActive,
      });
    } else if (!initialData && isOpen) {
      reset({
        name: "",
        startDate: "",
        endDate: "",
        isActive: false,
      });
    }
  }, [initialData, isOpen, reset]);

  const handleFormSubmit = async (newPeriod: PeriodFormData) => {
    try {
      const payload = {
        name: newPeriod.name,
        startDate: newPeriod.startDate,
        endDate: newPeriod.endDate,
        isActive: newPeriod.isActive,
      };

      if (initialData) {
        const res = await updateAcademicSession({
          id: initialData._id,
          ...payload,
        }).unwrap();
        showsuccess(res?.message || "Academic period updated successfully");
      } else {
        const res = await createAcademicSession(payload).unwrap();
        showsuccess(res?.message || "Academic period created successfully");
      }
      handleClose();
    } catch (error: any) {
      showerror(
        error.data?.message ||
          `Failed to ${initialData ? "update" : "create"} academic period`,
      );
    }
  };
  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={handleClose}
      ></div>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg">
          <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
            <h2 className="text-2xl font-bold text-foreground">
              {initialData ? "Edit Period" : "Period Information"}
            </h2>
            <button
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="p-6 space-y-6"
          >
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="[Year] [Term Name]"
                {...register("name")}
                className={`w-full px-4 py-2 border rounded-md bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                  errors.name ? "border-destructive" : "border-input"
                }`}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Beginning of academic period
                </label>
                <div className="relative">
                  <input
                    id="startDate"
                    type="date"
                    {...register("startDate")}
                    className={`w-full px-4 py-2 border rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                      errors.startDate ? "border-destructive" : "border-input"
                    }`}
                  />
                </div>
                {errors.startDate && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  End of academic period
                </label>
                <div className="relative">
                  <input
                    id="endDate"
                    type="date"
                    {...register("endDate")}
                    className={`w-full px-4 py-2 border rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                      errors.endDate ? "border-destructive" : "border-input"
                    }`}
                  />
                </div>
                {errors.endDate && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-foreground"
              >
                Mark as Active
              </label>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Switch
                      id="isActive"
                      checked={field.value}
                      onCheckedChange={async (checked) => {
                        field.onChange(checked);
                        if (initialData) {
                          try {
                            await updateStatus({
                              id: initialData._id,
                              isActive: checked,
                            }).unwrap();
                            showsuccess(
                              `Academic session set to ${
                                checked ? "active" : "inactive"
                              }`,
                            );
                          } catch (error: any) {
                            showerror(
                              error.data?.message || "Failed to update status",
                            );
                            field.onChange(!checked);
                          }
                        }
                      }}
                    />
                    {statusLoading && (
                      <Loader className="w-4 h-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                )}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={
                  createAcademicSessionLoading || updateAcademicSessionLoading
                }
                className="flex-1 px-6 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 font-medium transition-colors disabled:opacity-50"
              >
                {createAcademicSessionLoading ||
                updateAcademicSessionLoading ? (
                  <Loader className="mx-auto animate-spin" />
                ) : initialData ? (
                  "Save Changes"
                ) : (
                  "Create Period"
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
