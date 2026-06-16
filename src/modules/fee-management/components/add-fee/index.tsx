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
import { useGetAllStudentQuery } from "@/redux/api/student";
import { useState, useMemo, useRef, useEffect } from "react";
import { showerror, showsuccess } from "@/utils/toast";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { Search, CheckCircle2, X } from "lucide-react";

const feeFormSchema = z
  .object({
    name: z.string().min(1, "Fee name is required"),
    classes: z.array(z.string()),
    amount: z.number().min(1, "Amount is required"),
    applicableTo: z.string().min(1, "Applicable to is required"),
    students: z.array(z.string()).optional(),
    category: z.string().min(1, "Fee category is required"),
    academicPeriod: z.string().min(1, "Academic period is required"),
    period: z.string().min(1, "Period is required"),
    description: z.string().optional().or(z.literal("")),
    dueDate: z
      .string()
      .min(1, "Due date is required")
      .refine((date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(date) >= today;
      }, "Due date cannot be in the past"),

    discount: z
      .object({
        value: z.any().optional(),
        expiresAt: z.string().optional(),
        type: z.string().optional(),
      })
      .optional()
      .refine(
        (data) => {
          if (data?.expiresAt) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return new Date(data.expiresAt) >= today;
          }
          return true;
        },
        {
          message: "Expiry date cannot be in the past",
          path: ["expiresAt"],
        },
      )
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
  })
  .superRefine((data, ctx) => {
    if (
      data.applicableTo !== "INDIVIDUAL_SELECTION" &&
      (!data.classes || data.classes.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one class is required",
        path: ["classes"],
      });
    }
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
    key: "ALL_STUDENTS",
    label: "All Students",
  },
  {
    key: "NEW_STUDENTS_ONLY",
    label: "New Students Only",
  },
  {
    key: "RETURNING_STUDENTS_ONLY",
    label: "Returning Students Only",
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

export function CreateFeeModal({
  open,
  onOpenChange,
  isEdit,
  initialData,
  paymentItemId,
}: CreateFeeModalProps) {
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
      students: [],
      category: "",
      description: "",
      academicPeriod: "",
      period: "",
      dueDate: "",
    },
  });

  const [isClassOpen, setIsClassOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const selectedClasses = watch("classes") || [];
  const selectedCategory = watch("category");
  const applicableTo = watch("applicableTo");
  const selectedStudents = watch("students") || [];
  const discountType = watch("discount.type");
  const { currentUser } = useSelector((state: RootState) => state.authState);

  const isIndividual = applicableTo === "INDIVIDUAL_SELECTION";

  const {
    data: classes,
    isFetching: isClassesFetching,
    isLoading: isLoadingClasses,
  } = useGetAllClassesQuery();

  const {
    data: paymentCategories,
    isLoading: isLoadingPaymentCategories,
    isFetching: isPaymentCategoriesFetching,
  } = useGetPaymentCategoriesQuery({ limit: 1000 });
  const {
    data: academicSessions,
    isLoading: isLoadingAcademicSessions,
    isFetching: isAcademicSessionsFetching,
  } = useGetAllAcademicSessionQuery();

  const { data: studentsData, isLoading: isLoadingStudents } =
    useGetAllStudentQuery(
      { schoolId: String(currentUser?.schoolId), limit: 1000 },
      { skip: !currentUser?.schoolId },
    );

  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const studentDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        studentDropdownRef.current &&
        !studentDropdownRef.current.contains(event.target as Node)
      ) {
        setIsStudentDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredStudents = useMemo(() => {
    if (!studentSearchQuery)
      return studentsData?.data?.items?.slice(0, 10) || [];
    return (
      studentsData?.data?.items?.filter((s) =>
        `${s.firstName} ${s.lastName} ${s.admissionNumber}`
          .toLowerCase()
          .includes(studentSearchQuery.toLowerCase()),
      ) || []
    );
  }, [studentSearchQuery, studentsData]);

  const selectedStudentsData = useMemo(() => {
    return (
      studentsData?.data?.items?.filter((s) =>
        selectedStudents.includes(s._id),
      ) || []
    );
  }, [selectedStudents, studentsData]);

  const [createPayment, { isLoading }] = useCreatePaymentItemsMutation();
  const [updatePayment, { isLoading: isUpdating }] =
    useUpdatePaymentItemMutation();

  const onFormSubmit = async (data: FeeFormValues) => {
    if (isEdit && paymentItemId) {
      try {
        const res = await updatePayment({
          paymentItemId,
          body: {
            name: data.name,
            amount: data.amount,
            period: data.period,
            description: data.description || "",
            classes: isIndividual ? [] : data.classes ?? [],
            applicableTo: data.applicableTo,
            individuals:
              data.applicableTo === "INDIVIDUAL_SELECTION"
                ? data.students
                : undefined,
            dueDate: new Date(data.dueDate).toISOString(),
            ...(data.discount?.type && {
              discount: {
                ...data.discount,
                value: Number(data.discount?.value),
                expiresAt: data.discount?.expiresAt
                  ? new Date(data.discount.expiresAt).toISOString()
                  : undefined,
              },
            }),
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
        classes: isIndividual ? [] : data.classes ?? [],
        individuals:
          data.applicableTo === "INDIVIDUAL_SELECTION"
            ? data.students
            : undefined,
        description: data.description || "",
        dueDate: new Date(data.dueDate).toISOString(),
        name: data.name,
        period: data.period,
        ...(hasDiscount && {
          discount: {
            ...data.discount,
            value: Number(data.discount?.value),
            expiresAt: data.discount?.expiresAt
              ? new Date(data.discount.expiresAt).toISOString()
              : undefined,
          },
        }),
      }).unwrap();
      showsuccess(res?.message);
      reset();
      onOpenChange(false);
    } catch (error: any) {
      showerror(error?.data?.message);
    }
  };

  const handleReset = () => {
    reset();
  };

  const inputClass =
    "w-full h-10 px-3 rounded-lg text-sm border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all";
  const labelClass = "text-sm font-medium text-gray-700";
  const errorClass = "text-xs text-red-500 mt-1";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl! max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2 border-b border-gray-100">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {isEdit ? "Edit Fee Item" : "Create New Fee Item"}
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-0.5">
            {isEdit
              ? "Update the details of this fee item."
              : "Fill in the details to create a new fee item."}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5 pt-2">
          {/* Fee Name */}
          <div className="space-y-1.5">
            <label className={labelClass}>
              Fee Name <span className="text-red-400">*</span>
            </label>
            <input
              {...register("name")}
              type="text"
              placeholder="e.g. School Fees, PTA Levy"
              className={cn(inputClass, errors.name && "border-red-400 focus:border-red-400 focus:ring-red-500/20")}
            />
            {errors.name && <p className={errorClass}>{errors.name.message}</p>}
          </div>

          {/* Academic Period + Period side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>
                Academic Period <span className="text-red-400">*</span>
              </label>
              {isAcademicSessionsFetching || isLoadingAcademicSessions ? (
                <div className="h-10 bg-gray-100 w-full animate-pulse rounded-lg" />
              ) : (
                <>
                  <div className="relative">
                    <select
                      {...register("academicPeriod")}
                      className={cn(
                        inputClass,
                        "appearance-none pr-10",
                        errors.academicPeriod && "border-red-400 focus:border-red-400 focus:ring-red-500/20",
                      )}
                    >
                      <option value="">Select period</option>
                      {academicSessions?.data?.items
                        ?.filter((session) => session?.isActive)
                        ?.map((session) => (
                          <option key={session?.createdAt} value={session?._id}>
                            {session?.name}
                          </option>
                        ))}
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.academicPeriod && (
                    <p className={errorClass}>{errors.academicPeriod.message}</p>
                  )}
                </>
              )}
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>
                Period <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  {...register("period")}
                  className={cn(
                    inputClass,
                    "appearance-none pr-10",
                    errors.period && "border-red-400 focus:border-red-400 focus:ring-red-500/20",
                  )}
                >
                  {FEE_TYPE_OPTIONS.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Amount + Due Date side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>
                Amount (₦) <span className="text-red-400">*</span>
              </label>
              <input
                {...register("amount", {
                  required: "Amount is required",
                  valueAsNumber: true,
                })}
                type="number"
                placeholder="0.00"
                className={cn(
                  inputClass,
                  errors.amount && "border-red-400 focus:border-red-400 focus:ring-red-500/20",
                )}
              />
              {errors.amount && (
                <p className={errorClass}>{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>
                Due Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                {...register("dueDate")}
                className={cn(
                  inputClass,
                  errors.dueDate && "border-red-400 focus:border-red-400 focus:ring-red-500/20",
                )}
              />
              {errors.dueDate && (
                <p className={errorClass}>{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          {/* Fee Category */}
          <div className="space-y-1.5">
            <label className={labelClass}>
              Fee Category <span className="text-red-400">*</span>
            </label>
            {isPaymentCategoriesFetching || isLoadingPaymentCategories ? (
              <div className="h-10 bg-gray-100 w-full animate-pulse rounded-lg" />
            ) : (
              <>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className={cn(
                      inputClass,
                      "flex items-center justify-between cursor-pointer",
                      errors.category && "border-red-400 focus:border-red-400",
                    )}
                  >
                    <span
                      className={cn(
                        "truncate text-left",
                        !selectedCategory && "text-gray-400",
                      )}
                    >
                      {selectedCategory
                        ? paymentCategories?.data?.items?.find(
                            (c) => c._id === selectedCategory,
                          )?.name
                        : "Select fee category"}
                    </span>
                    <ChevronDownIcon
                      className={cn(
                        "size-4 text-gray-400 transition-transform shrink-0 ml-2",
                        isCategoryOpen && "rotate-180",
                      )}
                    />
                  </button>

                  {isCategoryOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-auto">
                      {paymentCategories?.data?.items?.map((cat) => (
                        <button
                          key={cat?._id}
                          type="button"
                          onClick={() => {
                            setValue("category", cat._id, {
                              shouldValidate: true,
                            });
                            setIsCategoryOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left",
                            selectedCategory === cat._id &&
                              "bg-purple-50 text-purple-700 font-medium",
                          )}
                        >
                          <span className="flex-1">{cat?.name}</span>
                          {selectedCategory === cat._id && (
                            <CheckIcon className="size-4 text-purple-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.category && (
                  <p className={errorClass}>{errors.category.message}</p>
                )}
              </>
            )}
          </div>

          {/* Applicable To */}
          <div className="space-y-1.5">
            <label className={labelClass}>
              Applicable To <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <select
                {...register("applicableTo")}
                className={cn(
                  inputClass,
                  "appearance-none pr-10",
                  errors.applicableTo && "border-red-400 focus:border-red-400 focus:ring-red-500/20",
                )}
              >
                <option value="">Select who this applies to</option>
                {APPLICABLE_TO_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.applicableTo && (
              <p className={errorClass}>{errors.applicableTo.message}</p>
            )}
          </div>

          {/* Classes — hidden when Individual Selection */}
          {!isIndividual && (
            <div className="space-y-1.5">
              <label className={labelClass}>
                Classes <span className="text-red-400">*</span>
              </label>

              {isClassesFetching || isLoadingClasses ? (
                <div className="h-10 bg-gray-100 w-full animate-pulse rounded-lg" />
              ) : (
                <>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsClassOpen(!isClassOpen)}
                      className={cn(
                        inputClass,
                        "flex items-center justify-between cursor-pointer",
                        errors.classes && "border-red-400",
                      )}
                    >
                      <span
                        className={cn(
                          "truncate text-left",
                          selectedClasses.length === 0 && "text-gray-400",
                        )}
                      >
                        {selectedClasses.length > 0
                          ? `${selectedClasses.length} class${selectedClasses.length > 1 ? "es" : ""} selected`
                          : "Select classes"}
                      </span>
                      <ChevronDownIcon
                        className={cn(
                          "size-4 text-gray-400 transition-transform shrink-0 ml-2",
                          isClassOpen && "rotate-180",
                        )}
                      />
                    </button>

                    {isClassOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-auto">
                        {classes?.data?.map((cls) => (
                          <label
                            key={cls?._id}
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              value={cls?._id}
                              {...register("classes")}
                              className="h-4 w-4 rounded border-gray-300 accent-purple-500"
                            />
                            <span className="text-sm flex-1">{cls?.name}</span>
                            {selectedClasses.includes(cls?._id) && (
                              <CheckIcon className="size-4 text-purple-600" />
                            )}
                          </label>
                        ))}

                        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-2">
                          <button
                            onClick={() => setIsClassOpen(false)}
                            type="button"
                            className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium transition-colors"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.classes && (
                    <p className={errorClass}>{errors.classes.message}</p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Student Search — shown only for Individual Selection */}
          {isIndividual && (
            <div className="space-y-3 p-4 bg-purple-50/50 rounded-xl border border-purple-100">
              <label className={cn(labelClass, "text-purple-800")}>
                Select Students <span className="text-red-400">*</span>
              </label>

              <div className="relative" ref={studentDropdownRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or admission number"
                    value={studentSearchQuery}
                    onChange={(e) => {
                      setStudentSearchQuery(e.target.value);
                      setIsStudentDropdownOpen(true);
                    }}
                    onFocus={() => setIsStudentDropdownOpen(true)}
                    className="w-full pl-9 pr-4 h-10 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 outline-none transition-all text-sm"
                  />
                </div>

                {isStudentDropdownOpen && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                    {isLoadingStudents ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        Loading students...
                      </div>
                    ) : filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <button
                          key={student._id}
                          type="button"
                          onClick={() => {
                            const isSelected = selectedStudents.includes(
                              student._id,
                            );
                            if (isSelected) {
                              setValue(
                                "students",
                                selectedStudents.filter(
                                  (id) => id !== student._id,
                                ),
                                { shouldValidate: true },
                              );
                            } else {
                              setValue(
                                "students",
                                [...selectedStudents, student._id],
                                { shouldValidate: true },
                              );
                            }
                            setStudentSearchQuery("");
                          }}
                          className="w-full p-3 text-left hover:bg-gray-50 flex items-center justify-between border-b last:border-0 border-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="size-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-[10px]">
                              {student.firstName[0]}
                              {student.lastName[0]}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {student.firstName} {student.lastName}
                              </p>
                              <p className="text-[10px] text-gray-500">
                                {student.admissionNumber}
                              </p>
                            </div>
                          </div>
                          {selectedStudents.includes(student._id) && (
                            <CheckCircle2 className="size-4 text-purple-600" />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500">
                        No students found
                      </div>
                    )}
                  </div>
                )}
              </div>

              {selectedStudentsData.length > 0 && (
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {selectedStudentsData.map((student) => (
                    <div
                      key={student._id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-purple-200 shadow-sm"
                    >
                      <span className="text-xs font-medium text-gray-800">
                        {student.firstName} {student.lastName}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setValue(
                            "students",
                            selectedStudents.filter((id) => id !== student._id),
                            { shouldValidate: true },
                          )
                        }
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {errors.students && (
                <p className={errorClass}>
                  {errors.students.message?.toString()}
                </p>
              )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <label className={labelClass}>Description</label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="Optional notes about this fee..."
              className={cn(
                "w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all resize-none",
              )}
            />
            {errors.description && (
              <p className={errorClass}>{errors.description.message}</p>
            )}
          </div>

          {/* Discount Section */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700">
                Discount{" "}
                <span className="text-xs font-normal text-gray-400 ml-1">
                  Optional
                </span>
              </h3>
            </div>

            <div className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Discount Type</label>
                <div className="relative">
                  <select
                    className={cn(inputClass, "appearance-none pr-10")}
                    {...register("discount.type")}
                  >
                    <option value="">None</option>
                    <option value="FLAT">Flat Rate</option>
                    <option value="PERCENTAGE">Percentage</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {discountType && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={labelClass}>
                      Discount Value{" "}
                      <span className="text-gray-400 font-normal text-xs">
                        ({discountType === "PERCENTAGE" ? "%" : "₦"})
                      </span>
                    </label>
                    <input
                      {...register("discount.value", { valueAsNumber: true })}
                      type="number"
                      placeholder={discountType === "PERCENTAGE" ? "e.g. 10" : "e.g. 500"}
                      className={cn(
                        inputClass,
                        errors.discount?.value && "border-red-400",
                      )}
                    />
                    {errors.discount?.value && (
                      <p className={errorClass}>
                        {String(errors.discount.value.message)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className={labelClass}>Expires At</label>
                    <input
                      type="date"
                      {...register("discount.expiresAt")}
                      className={cn(
                        inputClass,
                        errors.discount?.expiresAt && "border-red-400",
                      )}
                    />
                    {errors.discount?.expiresAt && (
                      <p className={errorClass}>
                        {String(errors.discount.expiresAt.message)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <button
              type="submit"
              disabled={isLoading || isUpdating}
              className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {isLoading || isUpdating
                ? isEdit
                  ? "Updating..."
                  : "Creating..."
                : isEdit
                  ? "Update Fee"
                  : "Create Fee"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
              Reset
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
