import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useDeleteStaffMutation } from "@/redux/api/school";
import { showerror, showsuccess } from "@/utils/toast";
import { AlertTriangle } from "lucide-react";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffData: any;
}

export function DeleteStaffModal({ isOpen, onClose, staffData }: DeleteModalProps) {
  const [deleteStaff, { isLoading }] = useDeleteStaffMutation();

  const handleDelete = async () => {
    try {
      await deleteStaff(staffData._id).unwrap();
      showsuccess("Staff member deleted successfully");
      onClose();
    } catch (error: any) {
      showerror(error?.data?.message || "Failed to delete staff");
    }
  };

  if (!staffData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-2xl p-6 border-none shadow-2xl bg-white text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        
        <DialogTitle className="text-xl font-bold text-gray-900 mb-2">Delete Staff Member</DialogTitle>
        <p className="text-gray-500 mb-6">
          Are you sure you want to delete <span className="font-semibold text-gray-700">{staffData.firstName} {staffData.lastName}</span>? 
          This action cannot be undone and will revoke their access.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 px-4 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-xl font-medium shadow-md transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
