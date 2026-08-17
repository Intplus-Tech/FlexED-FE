"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Student } from "@/@types/student";
import { ResendInviteButton } from "./resend-invite-button";

interface ResendInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export function ResendInviteModal({
  isOpen,
  onClose,
  student,
}: ResendInviteModalProps) {
  const parents = student?.parentDetails ?? [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-bold text-gray-900">
            Resend Invitation
            {student && (
              <span className="block text-sm font-normal text-gray-500 mt-0.5">
                {student.firstName} {student.lastName}
              </span>
            )}
          </DialogTitle>
          <DialogClose className="text-gray-400 hover:text-gray-600 transition-colors" />
        </DialogHeader>

        {parents.length > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            Choose a parent or guardian below to send them a fresh invitation
            email.
          </p>
        )}

        <div className="space-y-3 mt-4">
          {parents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No parent or guardian is linked to this student.
            </p>
          ) : (
            parents.map((parent) => (
              <div
                key={parent._id}
                className="border border-gray-200 rounded-xl bg-white overflow-hidden"
              >
                <div className="p-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {parent.firstName} {parent.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {parent.email}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${
                      parent.isRegistered
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {parent.isRegistered ? "Registered" : "Pending"}
                  </span>
                </div>
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                  <ResendInviteButton
                    email={parent.email}
                    isRegistered={parent.isRegistered}
                    className="w-full"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
