"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ClassItem } from "@/@types/class";
import { useBulkAssignClassMutation } from "@/redux/api/student";
import { showerror, showsuccess } from "@/utils/toast";

interface BulkAssignClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentIds: string[];
  classItems: ClassItem[];
  onSuccess: () => void;
}

export function BulkAssignClassModal({
  open,
  onOpenChange,
  studentIds,
  classItems,
  onSuccess,
}: BulkAssignClassModalProps) {
  const [selectedClassId, setSelectedClassId] = useState("");
  const [bulkAssignClass, { isLoading }] = useBulkAssignClassMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) {
      showerror("Please select a class");
      return;
    }

    try {
      const res = await bulkAssignClass({
        classId: selectedClassId,
        studentIds,
      }).unwrap();
      showsuccess(res?.message || "Students assigned to class successfully");
      onSuccess();
      onOpenChange(false);
      setSelectedClassId("");
    } catch (error: any) {
      showerror(
        error?.data?.message || "Failed to assign students to class"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md bg-white p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            Assign to Class
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <p className="text-sm text-gray-600">
            You are assigning <span className="font-semibold text-purple-600">{studentIds.length}</span> selected student(s) to a class.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Class
            </label>
            <div className="relative">
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-white pr-10 text-gray-900"
              >
                <option value="">Choose a class</option>
                {classItems?.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name} {cls.subClass || ""} ({cls.level})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedClassId}
              className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium disabled:opacity-50 transition-colors text-sm"
            >
              {isLoading ? "Assigning..." : "Assign Class"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
