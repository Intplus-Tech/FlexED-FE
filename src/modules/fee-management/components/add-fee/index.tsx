"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetAllClassesQuery } from "@/redux/api/class";
import {
  useCreatePaymentItemsMutation,
  useGetPaymentCategoriesQuery,
  useUpdatePaymentItemMutation,
} from "@/redux/api/transaction";
import { useGetAllAcademicSessionQuery } from "@/redux/api/academicSession";
import { useState } from "react";
import { showerror, showsuccess } from "@/utils/toast";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

const feeFormSchema = z.object({
  name: z.string().min(1, "Fee name is required"),
  classes: z.array(z.string()).min(1, "Class is required"),
  amount: z.number().min(1, "Amount is required"),
  applicableTo: z.string().min(1, "Applicable to is required"),
  category: z.string().min(1, "Fee category is required"),
  academicPeriod: z.string().min(1, "Academic period is required"),
  period: z.string().min(1, "Period is required"),
  description: z.string().min(1, "Description is required"),
  dueDate: z.string().min(1, "Due date is required"),

  discount: z
    .object({
      value: z.any().optional(),
      expiresAt: z.string().optional(),
      type: z.string().optional(),
    })
    .optional()
    .superRefine((data, ctx) => {
      if (data?.type && data.type !== "") {
        const value = Number(data.value);
        if (isNaN(value) || value <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Value must be a positive number",
            path: ["value"],
          });
        }
      }
    }),
});

type FeeFormValues = z.infer<typeof feeFormSchema>;

export const FEE_TYPE_OPTIONS = [
  {
    key: "PER_TERM",
    label: "Per Term",
  },
  {
    key: "PER_SESSION",
    label: "Per Session",
  },
];

export const APPLICABLE_TO_OPTIONS = [
  {
    key: "NEW_STUDENTS_ONLY",
    label: "New Students Only",
  },
  {
    key: "RETURNING_STUDENTS_ONLY",
    label: "Returning Students Only",
  },
  {
    key: "SPECIFIC_CLASSES_ONLY",
    label: "Specific Classes Only",
  },
  {
    key: "INDIVIDUAL_SELECTION",
    label: "Individual Selection",
  },
];

interface CreateFeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: FeeFormValues) => void;
  isEdit?: boolean;
  initialData?: any;
  paymentItemId?: string;
}

export function CreateFeeModal({ open, onOpenChange, isEdit, initialData, paymentItemId }: CreateFeeModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FeeFormValues>({
    resolver: zodResolver(feeFormSchema),
    defaultValues: initialData || {
      name: "",
      classes: [],
      amount: 0,
      applicableTo: "",
      category: "",
    },
  });

  console.log(errors, "errors");
  const [isOpen, setIsOpen] = useState(false);
  const selectedClasses = watch("classes") || [];
  const discountType = watch("discount.type");
  const { currentUser } = useSelector((state: RootState) => state.authState);
  const {
    data: classes,
    isFetching: isClassesFetching,
    isLoading: isLoadingClasses,
  } = useGetAllClassesQuery();

  const {
    data: paymentCategories,
    isLoading: isLoadingPaymentCategories,
    isFetching: isPaymentCategoriesFetching,
  } = useGetPaymentCategoriesQuery();

  const {
    data: academicSessions,
    isLoading: isLoadingAcademicSessions,
    isFetching: isAcademicSessionsFetching,
  } = useGetAllAcademicSessionQuery();

  console.log(academicSessions, "academicSessions");

  const [createPayment, { isLoading }] = useCreatePaymentItemsMutation();
  const [updatePayment, { isLoading: isUpdating }] = useUpdatePaymentItemMutation();

  const onFormSubmit = async (data: FeeFormValues) => {
    if (isEdit && paymentItemId) {
      try {
        const res = await updatePayment({
          paymentItemId,
          body: {
            name: data.name,
            amount: data.amount,
            period: data.period,
            description: data.description,
          },
        }).unwrap();
        showsuccess(res?.message || "Fee updated successfully!");
        reset();
        onOpenChange(false);
      } catch (error: any) {
        showerror(error?.data?.message || "Failed to update fee");
      }
      return;
    }

    try {
      const hasDiscount = !!data.discount?.type;
      const res = await createPayment({
        school: String(currentUser?.schoolId),
        academicPeriod: data.academicPeriod,
        amount: data.amount,
        applicableTo: data.applicableTo,
        category: data.category,
        classes: data.classes,
        description: data.description,
        dueDate: new Date(data.dueDate).toISOString(),
        name: data.name,
        period: data.period,
        ...(hasDiscount && {
          discount: {
            ...data.discount,
            value: Number(data.discount?.value),
          },
        }),
      }).unwrap();
      showsuccess(res?.message);
      reset();
      onOpenChange(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      showerror(error?.data?.message);
    }
  };

  const handleReset = () => {
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl! max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isEdit ? "Edit Fee Item" : "Create New Fee Item"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Fee Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Fee Name</label>
            <input
              {...register("name")}
              type="text"
              className={cn(
                "w-full h-10 px-3 rounded-md text-sm border border-gray-200 focus:outline-none",
                errors.name && "border-destructive"
              )}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Academic Period */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Academic Period</label>

            {isAcademicSessionsFetching || isLoadingAcademicSessions ? (
              <div className="h-10 bg-gray-200 w-full animate-pulse"></div>
            ) : (
              <>
                <div className="relative">
                  <select
                    {...register("academicPeriod")}
                    className={cn(
                      "w-full h-10 px-3 pr-10 appearance-none rounded-md text-sm border border-gray-200 focus:outline-none",
                      errors.academicPeriod && "border-destructive"
                    )}
                  >
                    <option value=""></option>
                    {academicSessions?.data?.items?.map((session) => (
                      <option key={session?.createdAt} value={session?._id}>
                        {session?.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                </div>
                {errors.academicPeriod && (
                  <p className="text-sm text-destructive">
                    {errors.academicPeriod.message}
                  </p>
                )}
              </>
            )}
          </div>

          {/*Peroid */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Period</label>
            <select
              {...register("period")}
              className={cn(
                "w-full h-10 px-3 pr-10 appearance-none  text-sm rounded-md border border-gray-200 focus:outline-none",
                errors.period && "border-destructive"
              )}
            >
              {FEE_TYPE_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Class */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Classes</label>

            {isClassesFetching || isLoadingClasses ? (
              <div className="h-10 border border-gray-200 bg-gray-200 w-full animate-pulse rounded-md"></div>
            ) : (
              <>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                      "w-full h-10 px-3 pr-10 flex items-center justify-between rounded-md border border-gray-200 bg-background text-sm ",
                      errors.classes && "border-destructive"
                    )}
                  >
                    <span className="truncate text-left">
                      {selectedClasses.length > 0
                        ? `${selectedClasses.length} selected`
                        : "Select classes"}
                    </span>
                    <ChevronDownIcon
                      className={cn(
                        "size-4 text-muted-foreground transition-transform",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>

                  {isOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-background border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                      {classes?.data?.map((cls) => (
                        <label
                          key={cls?._id}
                          className="flex items-center space-x-2 px-3 py-2 hover:bg-accent cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            value={cls?._id}
                            {...register("classes")}
                            className="h-4 w-4 rounded border-gray-200 accent-purple-500"
                          />
                          <span className="text-sm flex-1">{cls?.name}</span>
                          {selectedClasses.includes(cls?._id) && (
                            <CheckIcon className="size-4 text-primary" />
                          )}
                        </label>
                      ))}

                      <div className="flex items-center justify-center py-4">
                        <button
                          onClick={() => setIsOpen(false)}
                          type="button"
                          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {errors.classes && (
                  <p className="text-sm text-destructive">
                    {errors.classes.message}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <input
              {...register("amount", {
                required: "Amount is required",
                valueAsNumber: true,
              })}
              type="number"
              className={cn(
                "w-full h-10 px-3 rounded-md border border-gray-200 bg-background text-sm ",
                errors.amount && "border-destructive"
              )}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* Applicable To */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Applicable To</label>
            <div className="relative">
              <select
                {...register("applicableTo")}
                className={cn(
                  "w-full h-10 px-3 pr-10 appearance-none rounded-md border border-gray-200 bg-background text-sm ",
                  errors.applicableTo && "border-destructive"
                )}
              >
                <option value=""></option>
                {APPLICABLE_TO_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            </div>
            {errors.applicableTo && (
              <p className="text-sm text-destructive">
                {errors.applicableTo.message}
              </p>
            )}
          </div>

          {/* Fee Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Fee Category</label>
            {isPaymentCategoriesFetching || isLoadingPaymentCategories ? (
              <div className="h-10 bg-gray-200 w-full animate-pulse"></div>
            ) : (
              <>
                {" "}
                <div className="relative">
                  <select
                    {...register("category")}
                    className={cn(
                      "w-full h-10 px-3 pr-10 appearance-none rounded-md border border-gray-200 bg-background text-sm ",
                      errors.category && "border-destructive"
                    )}
                  >
                    <option value=""></option>
                    {paymentCategories?.data?.items?.map((categories) => (
                      <option key={categories?._id} value={categories?._id}>
                        {categories?.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                </div>
                {errors.category && (
                  <p className="text-sm text-destructive">
                    {errors.category.message}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col space-y-2 ">
            <label htmlFor="">Due Date </label>
            <input
              type="date"
              {...register("dueDate")}
              className="w-fit h-10 px-4 appearance-none  rounded-md border border-gray-200 bg-background text-sm "
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="">Description</label>
            <textarea
              {...register("description")}
              rows={7}
              className={cn(
                "w-full min-h-20 px-3 rounded-md border border-gray-200 bg-background text-sm "
              )}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Tuition Payment Terms Section */}
          <div className="pt-4 border-t">
            <h3 className="text-base font-semibold mb-4">
              Tuition Payment Discount (Optional)
            </h3>

            <div className="my-2">
              <select
                className="w-full outline-nont border border-gray-200 focus:outline-none py-2 rounded-md"
                {...register("discount.type")}
              >
                <option value="">None</option>
                <option value="FLAT">Flat Rate</option>
                <option value="PERCENTAGE">Percentage</option>
              </select>
            </div>

            {/* Early Payment Discount */}
            {discountType && (
              <>
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium">
                    Early Payment Discount
                  </label>
                  <input
                    {...register("discount.value", { valueAsNumber: true })}
                    type="number"
                    placeholder="0%"
                    className="w-full h-10 px-3 rounded-md border border-gray-200 bg-background text-sm"
                  />
                  {errors.discount?.value && (
                    <p className="text-sm text-destructive">
                      {String(errors.discount.value.message)}
                    </p>
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  <label htmlFor="">Expires At</label>
                  <input
                    type="date"
                    {...register("discount.expiresAt")}
                    className="w-fit h-10 px-4 appearance-none  rounded-md border border-gray-200 bg-background text-sm "
                  />
                </div>
              </>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              {isLoading || isUpdating ? (isEdit ? "Updating Fee" : "Creating Fee") : (isEdit ? "Update Fee" : "Create Fee")}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 text-foreground hover:bg-muted rounded-md text-sm font-medium transition-colors"
            >
              Reset
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
