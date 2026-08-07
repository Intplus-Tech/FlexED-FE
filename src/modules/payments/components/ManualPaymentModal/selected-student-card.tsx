"use client";

import { X } from "lucide-react";
import { Student } from "@/@types/student";
import { formatNaira } from "@/utils/functions";
import { ParentWalletBadge } from "./parent-wallet-badge";
import { ParentWalletInfo } from "./use-combined-parent-wallet-balance";

interface SelectedStudentCardProps {
  student: Student;
  className: string;
  expectedAmount?: number;
  walletInfoByParentId: Record<string, ParentWalletInfo>;
  onClear: () => void;
}

export function SelectedStudentCard({
  student,
  className,
  expectedAmount,
  walletInfoByParentId,
  onClear,
}: SelectedStudentCardProps) {
  return (
    <>
      <div className="relative p-5 bg-[#EDEEEF] rounded-2xl border border-gray-200 space-y-3 animate-in fade-in slide-in-from-top-2">
        <button
          type="button"
          onClick={onClear}
          className="absolute right-4 top-4 text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors"
        >
          <X size={18} />
        </button>
        <div className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-2">
          <span className="text-sm font-medium text-gray-500">Name:</span>
          <span className="text-sm font-bold text-gray-900">
            {student.firstName} {student.lastName}
          </span>
          <span className="text-sm font-medium text-gray-500">Class:</span>
          <span className="text-sm font-bold text-gray-900 uppercase">
            {className}
          </span>
          <span className="text-sm font-medium text-gray-500">
            Expected Amount:
          </span>
          <span className="text-sm font-bold text-gray-900">
            {expectedAmount !== undefined ? formatNaira(expectedAmount) : "..."}
          </span>
        </div>
      </div>

      {student.parentDetails?.length > 0 && (
        <div className="space-y-2">
          {student.parentDetails.map((parent) => (
            <ParentWalletBadge
              key={parent._id}
              parentName={`${parent.firstName} ${parent.lastName}`}
              relationship={parent.relationship}
              balance={walletInfoByParentId[parent._id]?.balance ?? 0}
              isLoading={walletInfoByParentId[parent._id]?.isLoading ?? false}
            />
          ))}
        </div>
      )}
    </>
  );
}
