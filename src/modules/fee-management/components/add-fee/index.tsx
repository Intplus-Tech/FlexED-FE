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
import { Search, CheckCircle2, X, AlertCircle } from "lucide-react";

const feeFormSchema = z.object({
  name: z.string().min(1, "Fee name is required"),
  classes: z.array(z.string()).min(1, "Class is required"),
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

  const [isOpen, setIsOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const selectedClasses = watch("classes") || [];
  const selectedCategory = watch("category");
  const applicableTo = watch("applicableTo");
  const selectedStudents = watch("students") || [];
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
    return studentsData?.data?.items?.filter((s) => selectedStudents.includes(s._id)) || [];
  }, [selectedStudents, studentsData]);

  console.log(academicSessions, "academicSessions");

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
            classes: data.classes,
            applicableTo: data.applicableTo,
            students: data.applicableTo === "INDIVIDUAL_SELECTION" ? data.students : undefined,
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
        classes: data.classes,
        students: data.applicableTo === "INDIVIDUAL_SELECTION" ? data.students : undefined,
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
                errors.name && "border-destructive",
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
                      errors.academicPeriod && "border-destructive",
                    )}
                  >
                    <option value=""></option>
                    {academicSessions?.data?.items
                      ?.filter((session) => session?.isActive)
                      ?.map((session) => (
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
                errors.period && "border-destructive",
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
                      errors.classes && "border-destructive",
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
                        isOpen && "rotate-180",
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
                errors.amount && "border-destructive",
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
                  errors.applicableTo && "border-destructive",
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

          {/* Student Search for Individual Selection */}
          {applicableTo === "INDIVIDUAL_SELECTION" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
              <label className="text-sm font-medium">Select Student</label>

              <div className="relative" ref={studentDropdownRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search Student"
                    value={studentSearchQuery}
                    onChange={(e) => {
                      setStudentSearchQuery(e.target.value);
                      setIsStudentDropdownOpen(true);
                    }}
                    onFocus={() => setIsStudentDropdownOpen(true)}
                    className="w-full pl-9 pr-4 h-10 bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm"
                  />
                </div>

                {isStudentDropdownOpen && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
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
                            const isSelected = selectedStudents.includes(student._id);
                            if (isSelected) {
                              setValue(
                                "students",
                                selectedStudents.filter((id) => id !== student._id),
                                { shouldValidate: true },
                              );
                            } else {
                              setValue("students", [...selectedStudents, student._id], {
                                shouldValidate: true,
                              });
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

              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {selectedStudentsData.map((student) => (
                  <div
                    key={student._id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200"
                  >
                    <span className="text-xs font-medium text-gray-900">
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
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {errors.students && (
                <p className="text-sm text-destructive">
                  {errors.students.message?.toString()}
                </p>
              )}
            </div>
          )}

          {/* Fee Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Fee Category</label>
            {isPaymentCategoriesFetching || isLoadingPaymentCategories ? (
              <div className="h-10 bg-gray-200 w-full animate-pulse rounded-md"></div>
            ) : (
              <>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className={cn(
                      "w-full h-10 px-3 pr-10 flex items-center justify-between rounded-md border border-gray-200 bg-background text-sm",
                      errors.category && "border-destructive",
                    )}
                  >
                    <span className="truncate text-left text-gray-500!">
                      {selectedCategory
                        ? paymentCategories?.data?.items?.find(
                            (c) => c._id === selectedCategory,
                          )?.name
                        : "Select fee category"}
                    </span>
                    <ChevronDownIcon
                      className={cn(
                        "size-4 text-muted-foreground transition-transform",
                        isCategoryOpen && "rotate-180",
                      )}
                    />
                  </button>

                  {isCategoryOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-background border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
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
                            "w-full flex items-center px-3 py-2.5 text-sm hover:bg-gray-100 transition-colors text-left",
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
                  <p className="text-sm text-destructive">
                    {errors.category.message}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="">Due Date </label>
            <input
              type="date"
              {...register("dueDate")}
              className={cn(
                "w-fit h-10 px-4 appearance-none rounded-md border border-gray-200 bg-background text-sm",
                errors.dueDate && "border-destructive",
              )}
            />
            {errors.dueDate && (
              <p className="text-sm text-destructive">
                {errors.dueDate.message}
              </p>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="">Description</label>
            <textarea
              {...register("description")}
              rows={7}
              className={cn(
                "w-full min-h-20 px-3 rounded-md border border-gray-200 bg-background text-sm ",
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
                    Sibling's Discount
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
                    className={cn(
                      "w-fit h-10 px-4 appearance-none rounded-md border border-gray-200 bg-background text-sm",
                      errors.discount?.expiresAt && "border-destructive",
                    )}
                  />
                  {errors.discount?.expiresAt && (
                    <p className="text-sm text-destructive">
                      {String(errors.discount.expiresAt.message)}
                    </p>
                  )}
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
              {isLoading || isUpdating
                ? isEdit
                  ? "Updating Fee"
                  : "Creating Fee"
                : isEdit
                  ? "Update Fee"
                  : "Create Fee"}
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
