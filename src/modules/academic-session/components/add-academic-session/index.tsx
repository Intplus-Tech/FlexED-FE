"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Switch } from "@/components/ui/switch";
import { useCreateAcademicSessionMutation } from "@/redux/api/academicSession";
import { showerror, showsuccess } from "@/utils/toast";
import { Loader } from "lucide-react";

const periodFormSchema = z.object({
  name: z
    .string()
    .min(1, "Period name is required")
    .min(3, "Period name must be at least 3 characters"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isActive: z
    .boolean()
    .default(true)
    .refine((value) => value !== undefined, {
      message: "isActive is required",
    }),
});

type PeriodFormData = z.infer<typeof periodFormSchema>;

interface AddPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddPeriodModal({
  isOpen,
  onClose,
}: AddPeriodModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(periodFormSchema),
    defaultValues: {
      isActive: true,
    },
  });

  const isActive = watch("isActive");

  const [createAcademicSession, { isLoading: createAcademicSessionLoading }] =
    useCreateAcademicSessionMutation();
  const handleFormSubmit = async (newPeriod: PeriodFormData) => {
    try {
      const period = {
        name: newPeriod.name,
        startDate: newPeriod.startDate,
        endDate: newPeriod.endDate,
        isActive: newPeriod.isActive,
      };
      const res = await createAcademicSession(period).unwrap();
      showsuccess(res?.message || "Academic period created successfully");
      handleClose();
    } catch (error: any) {
      showerror(error.data?.message || "Failed to create academic period");
    }
  };
  const handleClose = () => {
    onClose();
    reset();
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
              Period Information
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
                Active Status
              </label>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked: boolean) =>
                  setValue("isActive", checked)
                }
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-6 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 font-medium transition-colors"
              >
                {createAcademicSessionLoading ? (
                  <Loader className="mx-auto animate-spin" />
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
