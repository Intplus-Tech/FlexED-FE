"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogClose,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Student, ExemptedPayment, StudentDiscount } from "@/@types/student";
import { ClassItem } from "@/@types/class";
import {
  useGetStudentByIdQuery,
  useRemoveStudentExemptionMutation,
} from "@/redux/api/student";
import { useGetStudentFeeProfileQuery } from "@/redux/api/transaction";
import { StudentDiscountModal } from "../student-discount-modal";
import { StudentExemptionModal } from "../student-exemption-modal";

// ---------------------------------------------------------------------------
// Local types
// ---------------------------------------------------------------------------

interface PaymentItem {
  paymentItemId: string;
  name: string;
  totalAmount: number;
  amountPaidPreviously: number;
  currentBalance: number;
  dueDate?: string | null;
  status: string;
}

interface ParentEntry {
  _id?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  relationship?: string;
  address?: string;
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

function formatCurrency(amount: number) {
  return `₦${amount.toLocaleString()}`;
}

function formatDate(
  date: string,
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" },
) {
  return new Date(date).toLocaleDateString("en-US", options);
}

// ---------------------------------------------------------------------------
// Atoms
// ---------------------------------------------------------------------------

function InfoField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <div className="text-gray-900 font-semibold mt-1">{children}</div>
    </div>
  );
}

function TableTh({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
      {children}
    </th>
  );
}

function FeeStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    COMPLETED: { label: "Fully Paid", className: "bg-green-100 text-green-800" },
    PART_PAYMENT: { label: "Partially Paid", className: "bg-amber-100 text-amber-800" },
  };
  const resolved = map[status] ?? { label: "Unpaid", className: "bg-red-100 text-red-800" };
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${resolved.className}`}>
      {resolved.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-8 py-4">
      <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-xl bg-gray-200" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-1">
          <div className="bg-gray-100 rounded-xl p-4 h-24 flex-1 lg:w-44" />
          <div className="bg-gray-100 rounded-xl p-4 h-24 flex-1 lg:w-44" />
        </div>
      </div>
      <div className="border-b border-gray-200 pb-3 flex gap-8">
        <div className="h-4 w-40 bg-gray-200 rounded" />
        <div className="h-4 w-28 bg-gray-200 rounded" />
        <div className="h-4 w-28 bg-gray-200 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[28, 24, 36, 40].map((w) => (
          <div key={w} className="space-y-3">
            <div className={`h-4 w-${w} bg-gray-200 rounded`} />
            <div className="h-6 w-full bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Parent & Guardian
// ---------------------------------------------------------------------------

interface ParentTabProps {
  parentDetails: ParentEntry[];
  enrollmentDate?: string;
  classLabel: string;
}

function ParentTab({ parentDetails, enrollmentDate, classLabel }: ParentTabProps) {
  return (
    <div className="space-y-6">
      {parentDetails.length > 0 ? (
        parentDetails.map((parent, index) => (
          <div
            key={parent._id || index}
            className="bg-gray-50 border border-gray-100 rounded-xl p-6 space-y-4"
          >
            <h4 className="text-sm font-bold text-purple-600 uppercase tracking-wider">
              {parent.relationship || "Guardian"} Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <InfoField label="Name">{`${parent.firstName} ${parent.lastName}`}</InfoField>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Email Address
                </p>
                <p className="text-gray-900 font-medium mt-1 select-all">{parent.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Phone Number
                </p>
                <p className="text-gray-900 font-medium mt-1 select-all">{parent.phone || "N/A"}</p>
              </div>
              <InfoField label="Relationship">
                <span className="capitalize">{(parent.relationship || "PARENT").toLowerCase()}</span>
              </InfoField>
              {parent.address && (
                <div className="sm:col-span-2 md:col-span-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Address
                  </p>
                  <p className="text-gray-900 font-medium mt-1 select-all">{parent.address}</p>
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
          No parent/guardian information associated with this student.
        </div>
      )}

      <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <InfoField label="Enrollment Date">
          {enrollmentDate
            ? formatDate(enrollmentDate, { year: "numeric", month: "long", day: "numeric" })
            : "N/A"}
        </InfoField>
        <InfoField label="Current Class">{classLabel}</InfoField>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Fees Information
// ---------------------------------------------------------------------------

interface FeesTabProps {
  paymentItems: PaymentItem[];
  discounts: StudentDiscount[];
  exemptedPayments: ExemptedPayment[];
  selectedFeeItemIds: string[];
  removingExemptionId: string | null;
  onToggleFeeItem: (id: string, checked: boolean) => void;
  onToggleAllFeeItems: (checked: boolean) => void;
  onExemptSingle: (paymentItemId: string) => void;
  onExemptSelected: () => void;
  onAddDiscount: () => void;
  onManageDiscounts: () => void;
  onRemoveExemption: (paymentItemId: string) => void;
}

function FeesTab({
  paymentItems,
  discounts,
  exemptedPayments,
  selectedFeeItemIds,
  removingExemptionId,
  onToggleFeeItem,
  onToggleAllFeeItems,
  onExemptSingle,
  onExemptSelected,
  onAddDiscount,
  onManageDiscounts,
  onRemoveExemption,
}: FeesTabProps) {
  const allChecked =
    paymentItems.length > 0 &&
    paymentItems.every((i) => selectedFeeItemIds.includes(i.paymentItemId));
  const anyChecked = selectedFeeItemIds.length > 0;

  return (
    <div className="space-y-6">
      {/* Fee items table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900">Assigned Fee Item Breakdown</h3>
          <div className="flex items-center gap-2">
            {anyChecked && (
              <button
                onClick={onExemptSelected}
                className="text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                Exempt Selected ({selectedFeeItemIds.length})
              </button>
            )}
            <button
              onClick={onAddDiscount}
              className="text-sm font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              + Add Discount
            </button>
          </div>
        </div>

        {paymentItems.length > 0 ? (
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 border-2 border-gray-300 rounded cursor-pointer accent-orange-500"
                      checked={allChecked}
                      onChange={(e) => onToggleAllFeeItems(e.target.checked)}
                    />
                  </th>
                  <TableTh>Item Name</TableTh>
                  <TableTh>Total Amount</TableTh>
                  <TableTh>Paid So Far</TableTh>
                  <TableTh>Outstanding</TableTh>
                  <TableTh>Due Date</TableTh>
                  <TableTh>Action</TableTh>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {paymentItems.map((item) => {
                  const isChecked = selectedFeeItemIds.includes(item.paymentItemId);
                  return (
                    <tr
                      key={item.paymentItemId}
                      className={`transition-colors ${isChecked ? "bg-orange-50/60" : "hover:bg-gray-50/50"}`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          className="w-4 h-4 border-2 border-gray-300 rounded cursor-pointer accent-orange-500"
                          checked={isChecked}
                          onChange={(e) => onToggleFeeItem(item.paymentItemId, e.target.checked)}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {formatCurrency(item.totalAmount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-green-600 font-semibold">
                        {formatCurrency(item.amountPaidPreviously)}
                      </td>
                      <td className="px-6 py-4 text-sm text-rose-600 font-semibold">
                        {formatCurrency(item.currentBalance)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.dueDate ? formatDate(item.dueDate) : "No deadline"}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          disabled={anyChecked}
                          onClick={() => onExemptSingle(item.paymentItemId)}
                          className="text-xs font-semibold text-orange-600 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Exempt
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
            No active fee components assigned to this student.
          </div>
        )}
      </div>

      {/* Active discounts */}
      {discounts.length > 0 && (
        <div className="border-t border-gray-100 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Active Student Discounts</h3>
            <button
              onClick={onManageDiscounts}
              className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
            >
              Manage Discounts
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {discounts.map((discount, idx) => (
              <div
                key={discount.paymentItem || idx}
                className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-bold text-emerald-800">
                    {discount.type === "PERCENTAGE"
                      ? `${discount.value}% Discount`
                      : `${formatCurrency(discount.value)} Discount`}
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">
                    Expires:{" "}
                    {formatDate(discount.expiresAt, { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
                <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-800">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active exemptions */}
      {exemptedPayments.length > 0 && (
        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-base font-bold text-gray-900 mb-4">Active Exemptions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exemptedPayments.map((exemption) => (
              <div
                key={exemption.paymentItemId}
                className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-orange-800 truncate">{exemption.name}</p>
                  <p className="text-xs text-orange-700 mt-0.5">{formatCurrency(exemption.amount)}</p>
                  {exemption.reason && (
                    <p className="text-xs text-orange-600 mt-1 line-clamp-2">{exemption.reason}</p>
                  )}
                </div>
                <button
                  disabled={removingExemptionId === exemption.paymentItemId}
                  onClick={() => onRemoveExemption(exemption.paymentItemId)}
                  className="shrink-0 text-xs text-red-500 hover:text-red-700 font-semibold transition-colors disabled:opacity-50"
                >
                  {removingExemptionId === exemption.paymentItemId ? "Removing..." : "Remove"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Payment Breakdown
// ---------------------------------------------------------------------------

function PaymentTab({ paymentItems }: { paymentItems: PaymentItem[] }) {
  return (
    <div>
      <h3 className="text-base font-bold text-gray-900 mb-4">Payment Item Summary</h3>
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <TableTh>Fee Item</TableTh>
              <TableTh>Total Cost</TableTh>
              <TableTh>Total Paid</TableTh>
              <TableTh>Outstanding</TableTh>
              <TableTh>Status</TableTh>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {paymentItems.length > 0 ? (
              paymentItems.map((item) => (
                <tr key={item.paymentItemId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {formatCurrency(item.totalAmount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-green-600 font-semibold">
                    {formatCurrency(item.amountPaidPreviously)}
                  </td>
                  <td className="px-6 py-4 text-sm text-rose-600 font-semibold">
                    {formatCurrency(item.currentBalance)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <FeeStatusBadge status={item.status} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500 bg-gray-50">
                  No payment breakdown available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const TABS = [
  { id: "parent", label: "Parent & Guardian Information" },
  { id: "fees", label: "Fees Information" },
  { id: "payment", label: "Payment Breakdown & Items" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  classItems: ClassItem[];
}

export function StudentProfileModal({
  isOpen,
  onClose,
  student,
  classItems,
}: StudentProfileModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("parent");
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isExemptionModalOpen, setIsExemptionModalOpen] = useState(false);
  const [exemptingPaymentItemId, setExemptingPaymentItemId] = useState<string | undefined>(undefined);
  const [selectedFeeItemIds, setSelectedFeeItemIds] = useState<string[]>([]);
  const [removingExemptionId, setRemovingExemptionId] = useState<string | null>(null);

  const [removeExemption] = useRemoveStudentExemptionMutation();

  const { data: studentData, isLoading: isStudentLoading } = useGetStudentByIdQuery(
    student?._id || "",
    { skip: !isOpen || !student?._id },
  );

  const { data: feeProfileResponse, isLoading: isFeeLoading } = useGetStudentFeeProfileQuery(
    student?._id || "",
    { skip: !isOpen || !student?._id },
  );

  if (!student) return null;

  const isLoading = isStudentLoading || isFeeLoading;
  const activeStudent = studentData || student;
  const paymentItems: PaymentItem[] = feeProfileResponse?.data?.paymentItem ?? [];
  const discounts: StudentDiscount[] = studentData?.discounts ?? [];
  const exemptedPayments: ExemptedPayment[] = studentData?.exemptedPayments ?? [];

  const totalPaid = paymentItems.reduce((sum, item) => sum + item.amountPaidPreviously, 0);
  const totalOutstanding = feeProfileResponse?.data?.totalExpectedBalance ?? 0;

  const getClassLabel = (classId: any): string => {
    if (!classId) return "";
    if (typeof classId === "object" && classId.name) return classId.name;
    const id = typeof classId === "object" ? classId._id : classId;
    return classItems?.find((c) => c._id === id)?.name ?? (typeof classId === "string" ? classId : "");
  };

  const handleRemoveExemption = async (paymentItemId: string) => {
    setRemovingExemptionId(paymentItemId);
    try {
      await removeExemption({ studentId: activeStudent._id, paymentItemId }).unwrap();
    } catch {
      // error handling delegated to RTK middleware
    } finally {
      setRemovingExemptionId(null);
    }
  };

  const handleOpenExemptSingle = (paymentItemId: string) => {
    setExemptingPaymentItemId(paymentItemId);
    setIsExemptionModalOpen(true);
  };

  const handleOpenExemptSelected = () => {
    setExemptingPaymentItemId(undefined);
    setIsExemptionModalOpen(true);
  };

  const handleCloseExemptionModal = () => {
    setIsExemptionModalOpen(false);
    setExemptingPaymentItemId(undefined);
    setSelectedFeeItemIds([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl! w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between my-2 border-b border-gray-100 pb-3">
          <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
          <DialogClose className="text-gray-400 hover:text-gray-600 transition-colors" />
        </div>

        {isLoading ? (
          <ProfileSkeleton />
        ) : (
          <>
            <DialogHeader className="flex flex-col lg:flex-row items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <Image
                    src={studentData?.profileImageId?.url || "/images/avatar.svg"}
                    alt={`${activeStudent.firstName} ${activeStudent.lastName}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                    priority
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {activeStudent.firstName} {activeStudent.lastName}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Student ID:{" "}
                    <span className="font-mono text-xs">{activeStudent._id}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Class:{" "}
                    <span className="font-medium">{getClassLabel(activeStudent.class)}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Gender:{" "}
                    <span className="font-medium capitalize">
                      {activeStudent.gender?.toLowerCase() || "N/A"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-1">
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex-1 lg:w-44">
                  <p className="text-xs text-green-600 font-semibold mb-1 uppercase tracking-wider">
                    Total Paid
                  </p>
                  <p className="text-2xl font-bold text-green-800">{formatCurrency(totalPaid)}</p>
                </div>
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex-1 lg:w-44">
                  <p className="text-xs text-rose-600 font-semibold mb-1 uppercase tracking-wider">
                    Outstanding
                  </p>
                  <p className="text-2xl font-bold text-rose-800">
                    {formatCurrency(totalOutstanding)}
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="mt-8 border-b border-gray-200">
              <div className="flex gap-8">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 text-sm font-semibold transition-all relative ${
                      activeTab === tab.id
                        ? "text-purple-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-purple-600"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              {activeTab === "parent" && (
                <ParentTab
                  parentDetails={activeStudent.parentDetails as ParentEntry[]}
                  enrollmentDate={activeStudent.createdAt}
                  classLabel={getClassLabel(activeStudent.class)}
                />
              )}
              {activeTab === "fees" && (
                <FeesTab
                  paymentItems={paymentItems}
                  discounts={discounts}
                  exemptedPayments={exemptedPayments}
                  selectedFeeItemIds={selectedFeeItemIds}
                  removingExemptionId={removingExemptionId}
                  onToggleFeeItem={(id, checked) =>
                    setSelectedFeeItemIds((prev) =>
                      checked ? [...prev, id] : prev.filter((x) => x !== id),
                    )
                  }
                  onToggleAllFeeItems={(checked) =>
                    setSelectedFeeItemIds(checked ? paymentItems.map((i) => i.paymentItemId) : [])
                  }
                  onExemptSingle={handleOpenExemptSingle}
                  onExemptSelected={handleOpenExemptSelected}
                  onAddDiscount={() => setIsDiscountModalOpen(true)}
                  onManageDiscounts={() => setIsDiscountModalOpen(true)}
                  onRemoveExemption={handleRemoveExemption}
                />
              )}
              {activeTab === "payment" && <PaymentTab paymentItems={paymentItems} />}
            </div>
          </>
        )}
      </DialogContent>

      <StudentDiscountModal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        studentId={activeStudent._id}
        paymentItems={paymentItems}
        existingDiscounts={discounts}
      />

      <StudentExemptionModal
        isOpen={isExemptionModalOpen}
        onClose={handleCloseExemptionModal}
        studentId={activeStudent._id}
        paymentItems={paymentItems}
        preSelectedPaymentItemId={
          selectedFeeItemIds.length === 0 ? exemptingPaymentItemId : undefined
        }
        preSelectedPaymentItemIds={
          selectedFeeItemIds.length > 0 ? selectedFeeItemIds : undefined
        }
      />
    </Dialog>
  );
}
