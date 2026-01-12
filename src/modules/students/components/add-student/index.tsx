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
import { Loader } from "lucide-react";
import { ClassItem } from "@/@types/class";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classItems: ClassItem[];
  isClassesLoading: boolean;
}

export function AddStudentModal({
  isOpen,
  onClose,
  classItems,
  isClassesLoading,
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

  console.log(errors, "errors ");
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
    } catch (error: any) {
      showerror(error?.data?.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl! w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex justify-between items-center pb-6">
          <DialogTitle>{"Add Student"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stepper */}
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
                Parents/Guardians Info
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-6">
                {/* Student Picture */}
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Student Picture
                  </label>
                  <div className="flex gap-6 items-center">
                    <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span>No Image</span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>

                {/* Student Name */}
                <div>
                  <label className="block mb-1 font-medium">First Name</label>
                  <input
                    placeholder="First Name"
                    {...register("firstName")}
                    className="w-full p-2 border rounded"
                  />
                  {errors.firstName && (
                    <p className="text-red-500">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block mb-1 font-medium">Last Name</label>
                  <input
                    placeholder="Last Name"
                    {...register("lastName")}
                    className="w-full p-2 border rounded"
                  />
                  {errors.lastName && (
                    <p className="text-red-500">{errors.lastName.message}</p>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block mb-1 font-medium">
                    Admission Number (optional)
                  </label>
                  <input
                    type="string"
                    {...register("admissionNumber")}
                    className="w-full p-2 border rounded"
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500">
                      {errors?.admissionNumber?.message}
                    </p>
                  )}
                </div>
                {/* Date of Birth */}
                <div>
                  <label className="block mb-1 font-medium">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    {...register("dateOfBirth")}
                    className="w-full p-2 border rounded"
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500">{errors.dateOfBirth.message}</p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block mb-1 font-medium">Gender</label>
                  <select
                    {...register("gender")}
                    className="w-full p-2 border rounded"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>

                {/* Class */}
                <div>
                  <label className="block mb-1 font-medium">Class</label>
                  {isClassesLoading ? (
                    <div className="h-10 w-full bg-gray-200 animate-pulse"></div>
                  ) : (
                    <select
                      {...register("class")}
                      className="w-full p-2 border rounded"
                    >
                      {classItems?.map((classItem) => (
                        <option key={classItem._id} value={classItem._id}>
                          {classItem.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full py-2 bg-purple-600 text-white rounded"
                >
                  Next
                </button>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-6">
                {fields.map((field, index) => (
                  <div key={field.id} className="border p-4 rounded space-y-2">
                    <h4 className="font-semibold mb-2">
                      Parent/Guardian {index + 1}
                    </h4>

                    <div>
                      <label className="block mb-1 font-medium">
                        First Name
                      </label>
                      <input
                        {...register(`parentDetails.${index}.firstName`)}
                        className="w-full p-2 border rounded"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-medium">
                        Last Name
                      </label>
                      <input
                        {...register(`parentDetails.${index}.lastName`)}
                        className="w-full p-2 border rounded"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-medium">Email</label>
                      <input
                        {...register(`parentDetails.${index}.email`)}
                        className="w-full p-2 border rounded"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-medium">Phone</label>
                      <input
                        {...register(`parentDetails.${index}.phone`)}
                        className="w-full p-2 border rounded"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-medium">Address</label>
                      <input
                        {...register(`parentDetails.${index}.address`)}
                        className="w-full p-2 border rounded"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-medium">
                        Occupation
                      </label>
                      <input
                        {...register(`parentDetails.${index}.occupation`)}
                        className="w-full p-2 border rounded"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-medium">
                        Relationship
                      </label>
                      <select
                        {...register(`parentDetails.${index}.relationship`)}
                        className="w-full p-2 border rounded"
                      >
                        <option value="PARENT">Parent</option>
                        <option value="GUARDIAN">Guardian</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 font-medium">Gender</label>
                      <select
                        {...register(`parentDetails.${index}.gender`)}
                        className="w-full p-2 border rounded"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 font-medium">Title</label>
                      <input
                        {...register(`parentDetails.${index}.title`)}
                        className="w-full p-2 border rounded"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500 mt-1"
                    >
                      Remove
                    </button>
                  </div>
                ))}

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
                  className="py-2 px-4 bg-gray-200 rounded"
                >
                  Add Another Parent
                </button>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setStep(1)}
                    type="button"
                    className="w-full py-2 bg-black text-white rounded"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="w-full py-2 bg-purple-600 text-white rounded"
                  >
                    {isLoading ? (
                      <Loader className="mx-auto animate-spin" />
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
