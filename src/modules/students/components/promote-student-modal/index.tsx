"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { ChevronDown, ArrowRight, Loader, GraduationCap } from "lucide-react";
import { RootState } from "@/redux/store";
import { ClassItem } from "@/@types/class";
import {
  useGetAllStudentQuery,
  usePromoteStudentsMutation,
} from "@/redux/api/student";
import { showerror, showsuccess } from "@/utils/toast";
import {
  SearchableMultiSelect,
  SearchableMultiSelectOption,
} from "@/components/searchable-multiselect";

/** Minimal shape needed for single-student mode — satisfied by both the
 * list-page `Student` (class is an id string) and `StudentDetail` (class is
 * a populated object) types. */
export interface PromotableStudent {
  _id: string;
  firstName: string;
  lastName: string;
  class: string | { _id: string };
}

interface PromoteStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classItems: ClassItem[];
  /** When provided, the modal runs in single-student mode: from-class is
   * locked to this student's class and only they get promoted. */
  student?: PromotableStudent | null;
  onSuccess?: () => void;
}

function getClassId(classValue: unknown): string {
  if (!classValue) return "";
  if (typeof classValue === "object" && classValue !== null && "_id" in classValue) {
    return (classValue as { _id: string })._id;
  }
  return classValue as string;
}

export function PromoteStudentModal({
  open,
  onOpenChange,
  classItems,
  student,
  onSuccess,
}: PromoteStudentModalProps) {
  const isSingleMode = !!student;
  const { currentUser } = useSelector((state: RootState) => state.authState);

  const [fromClassId, setFromClassId] = useState("");
  const [toClassId, setToClassId] = useState("");
  const [excludeStudentIds, setExcludeStudentIds] = useState<string[]>([]);

  const [promoteStudents, { isLoading }] = usePromoteStudentsMutation();

  useEffect(() => {
    if (open) {
      setFromClassId(isSingleMode ? getClassId(student?.class) : "");
      setToClassId("");
      setExcludeStudentIds([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, student]);

  const { data: classmatesData, isFetching: isFetchingClassmates } =
    useGetAllStudentQuery(
      {
        schoolId: currentUser?.schoolId as string,
        limit: 1000,
        classId: fromClassId,
      },
      { skip: !open || !fromClassId },
    );

  const classmates = useMemo(
    () => classmatesData?.data?.items ?? [],
    [classmatesData],
  );

  const excludeOptions: SearchableMultiSelectOption[] = useMemo(
    () =>
      classmates.map((s) => ({
        value: s._id,
        label: `${s.firstName} ${s.lastName}`,
        subLabel: s.admissionNumber,
      })),
    [classmates],
  );

  const fromClassLabel = useMemo(() => {
    const cls = classItems.find((c) => c._id === fromClassId);
    return cls ? `${cls.name} ${cls.subClass || ""}`.trim() : "";
  }, [classItems, fromClassId]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromClassId || !toClassId) {
      showerror("Please select both the from and to class");
      return;
    }
    if (fromClassId === toClassId) {
      showerror("From class and to class cannot be the same");
      return;
    }

    let finalExcludeIds = excludeStudentIds;
    if (isSingleMode && student) {
      finalExcludeIds = classmates
        .map((s) => s._id)
        .filter((id) => id !== student._id);
    }

    try {
      const res = await promoteStudents({
        classMappings: [{ fromClassId, toClassId }],
        excludeStudentIds: finalExcludeIds,
        dryRun: false,
      }).unwrap();
      showsuccess(res?.message || "Students promoted successfully");
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      showerror(error?.data?.message || "Failed to promote students");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="w-full max-w-md bg-white p-8">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <GraduationCap className="text-purple-600" size={24} />
            {isSingleMode
              ? `Promote ${student?.firstName} ${student?.lastName}`
              : "Promote Students"}
          </DialogTitle>
          <DialogClose className="text-gray-400 hover:text-gray-600 transition-colors" />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {!isSingleMode && (
            <p className="text-sm text-gray-600">
              Move every student from one class to another. You can exclude
              specific students so they stay behind.
            </p>
          )}

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Class
              </label>
              {isSingleMode ? (
                <div className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 text-sm">
                  {fromClassLabel || "—"}
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={fromClassId}
                    onChange={(e) => {
                      setFromClassId(e.target.value);
                      setExcludeStudentIds([]);
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-white pr-10 text-gray-900"
                  >
                    <option value="">Select class</option>
                    {classItems?.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name} {cls.subClass || ""} ({cls.level})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              )}
            </div>

            <ArrowRight className="text-gray-400 mt-6 shrink-0" size={20} />

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Class
              </label>
              <div className="relative">
                <select
                  value={toClassId}
                  onChange={(e) => setToClassId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-white pr-10 text-gray-900"
                >
                  <option value="">Select class</option>
                  {classItems
                    ?.filter((cls) => cls._id !== fromClassId)
                    .map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name} {cls.subClass || ""} ({cls.level})
                      </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {!isSingleMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exclude Students{" "}
                <span className="text-gray-400 font-normal text-xs">
                  (optional — these students will stay in their current class)
                </span>
              </label>
              <SearchableMultiSelect
                options={excludeOptions}
                selected={excludeStudentIds}
                onChange={setExcludeStudentIds}
                isLoading={isFetchingClassmates}
                disabled={!fromClassId}
                placeholder={
                  fromClassId
                    ? "Search students to exclude..."
                    : "Select a from class first"
                }
                searchPlaceholder="Search by name or admission number"
                emptyMessage="No students found in this class"
              />
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !fromClassId || !toClassId}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium disabled:opacity-50 transition-colors text-sm"
            >
              {isLoading && <Loader className="w-4 h-4 animate-spin" />}
              {isLoading ? "Promoting..." : "Promote"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
