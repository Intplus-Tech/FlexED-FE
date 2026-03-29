import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  useInviteStaffMutation,
  useUpdateStaffMutation,
} from "@/redux/api/school";
import { InviteStaffRequest, UpdateStaffRequest } from "@/@types/school";
import { showerror, showsuccess } from "@/utils/toast";

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffData?: any; // If provided, we are in Edit mode
}

export function StaffModal({ isOpen, onClose, staffData }: StaffModalProps) {
  const isEdit = !!staffData;
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InviteStaffRequest>();

  const [inviteStaff, { isLoading: isInviting }] = useInviteStaffMutation();
  const [updateStaff, { isLoading: isUpdating }] = useUpdateStaffMutation();

  useEffect(() => {
    if (staffData && isOpen) {
      reset({
        firstName: staffData.firstName,
        lastName: staffData.lastName,
        email: staffData.email,
        phone: staffData.phone,
        address: staffData.address,
        gender: staffData.gender,
        staffNumber: staffData.staffNumber,
        position: staffData.position,
      });
    } else if (!staffData && isOpen) {
      reset({});
    }
  }, [staffData, isOpen, reset]);

  const onSubmit = async (data: InviteStaffRequest) => {
    try {
      if (isEdit) {
        // Exclude email from update payload if not allowed, or keep it depending on API
        const updatePayload: UpdateStaffRequest = {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          address: data.address,
          gender: data.gender,
          staffNumber: data.staffNumber,
          position: data.position,
        };
        await updateStaff({
          staffId: staffData._id,
          data: updatePayload,
        }).unwrap();
        showsuccess("Staff updated successfully");
      } else {
        await inviteStaff(data).unwrap();
        showsuccess("Staff invited successfully");
      }
      onClose();
      reset();
    } catch (error: any) {
      showerror(error?.data?.message || "An error occurred");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl p-0 border-none shadow-2xl bg-white">
        <div className="bg-linear-to-br from-purple-900 to-purple-600 p-6 text-white text-center">
          <DialogTitle className="text-xl font-bold">
            {isEdit ? "Update Staff Member" : "Invite New Staff"}
          </DialogTitle>
          <p className="text-gray-300 text-sm mt-1">
            {isEdit
              ? "Modify staff details below"
              : "Send an invitation to join your school"}
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  {...register("firstName", {
                    required: "First name is required",
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-600 outline-none"
                  placeholder="John"
                />
                {errors.firstName && (
                  <span className="text-xs text-red-500">
                    {errors.firstName.message}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  {...register("lastName", {
                    required: "Last name is required",
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-600 outline-none"
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <span className="text-xs text-red-500">
                    {errors.lastName.message}
                  </span>
                )}
              </div>
            </div>

            {!isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  {...register("email", { required: "Email is required" })}
                  className={`w-full border border-gray-300 ${isEdit ? "bg-gray-100" : ""} rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-600 outline-none`}
                  placeholder="john.doe@example.com"
                  readOnly={isEdit}
                />
                {errors.email && (
                  <span className="text-xs text-red-500">
                    {errors.email.message}
                  </span>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  {...register("phone")}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-600 outline-none"
                  placeholder="+234 800..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  {...register("gender")}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-600 outline-none bg-white"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Home Address
              </label>
              <input
                type="text"
                {...register("address")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-600 outline-none"
                placeholder="123 Main St..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Staff Number
                </label>
                <input
                  type="text"
                  {...register("staffNumber")}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-600 outline-none"
                  placeholder="STF-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position / Role
                </label>
                <input
                  type="text"
                  {...register("position")}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-purple-600 outline-none"
                  placeholder="Teacher"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                disabled={isInviting || isUpdating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-white bg-purple-600 hover:bg-purple-700 rounded-lg font-medium shadow-md transition-colors disabled:opacity-50"
                disabled={isInviting || isUpdating}
              >
                {isInviting || isUpdating
                  ? "Saving..."
                  : isEdit
                    ? "Update Staff"
                    : "Send Invite"}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
