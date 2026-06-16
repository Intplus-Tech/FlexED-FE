"use client";

import { useState } from "react";
import FeeTableLoader from "../../loader/fee-table-loader";
import { PaymentItem } from "@/@types/transaction";
import { MoreVertical, Pencil, Trash2, Eye, X } from "lucide-react";
import { CreateFeeModal } from "../add-fee";
import {
  useDeletePaymentItemMutation,
  useLazyGetPaymentItemQuery,
} from "@/redux/api/transaction";
import { showerror, showsuccess } from "@/utils/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface FeeTableProps {
  fees: PaymentItem[];
  isLoading?: boolean;
  searchQuery?: string;
}

export function FeeTable({
  fees,
  isLoading = false,
  searchQuery = "",
}: FeeTableProps) {
  // Action Modals State
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [viewFeeData, setViewFeeData] = useState<PaymentItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [editFeeData, setEditFeeData] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [deleteFeeData, setDeleteFeeData] = useState<PaymentItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [deletePaymentItem] = useDeletePaymentItemMutation();
  const [fetchPaymentItem, { isFetching: isFetchingPaymentItem }] =
    useLazyGetPaymentItemQuery();

  const toggleDropdown = (id: string) => {
    setActiveDropdown((prev) => (prev === id ? null : id));
  };

  // Handlers
  const handleViewClick = (fee: PaymentItem) => {
    setViewFeeData(fee);
    setIsViewModalOpen(true);
    setActiveDropdown(null);
  };

  const handleEditClick = async (fee: PaymentItem) => {
    setActiveDropdown(null);
    try {
      const result = await fetchPaymentItem(fee._id).unwrap();
      const data = result.data;
      const mappedData = {
        name: data.name,
        classes: data.classes ? (data.classes as any[]).map((c) => c._id) : [],
        amount: data.amount,
        applicableTo: data.applicableTo,
        students: data.individuals || data.students || [],
        category:
          typeof data.category === "object"
            ? data.category?._id
            : data.category,
        academicPeriod:
          typeof data.academicPeriod === "object"
            ? (data.academicPeriod as any)._id
            : data.academicPeriod,
        period: data.period,
        description: data.description || "",
        dueDate: data.dueDate
          ? new Date(data.dueDate).toISOString().split("T")[0]
          : "",
        discount: data.discount
          ? {
              ...data.discount,
              expiresAt: data.discount.expiresAt
                ? new Date(data.discount.expiresAt).toISOString().split("T")[0]
                : "",
            }
          : { type: "", value: "" },
      };
      setEditFeeData({ ...mappedData, _id: fee._id });
      setIsEditModalOpen(true);
    } catch {
      showerror("Failed to load fee details");
    }
  };

  const handleDeleteClick = (fee: PaymentItem) => {
    setDeleteFeeData(fee);
    setIsDeleteModalOpen(true);
    setActiveDropdown(null);
  };

  const confirmDelete = async () => {
    if (!deleteFeeData) return;
    try {
      const res = await deletePaymentItem(deleteFeeData._id).unwrap();
      showsuccess(res?.message || "Fee deleted successfully");
      setIsDeleteModalOpen(false);
      setDeleteFeeData(null);
    } catch (error: any) {
      showerror(error?.data?.message || "Failed to delete fee");
    }
  };

  if (isLoading) {
    return <FeeTableLoader />;
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-visible relative">
        <div className="overflow-x-auto overflow-y-visible min-h-[300px]">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Fee/Payment Item
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Applicable To
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Classes
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Tenure
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 relative">
              {fees?.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No fees found
                  </td>
                </tr>
              ) : (
                fees?.map((fee) => (
                  <tr
                    key={fee._id}
                    className="hover:bg-gray-50 transition-colors relative"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {fee?.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ₦{fee?.amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {fee?.applicableTo?.replace(/_/g, " ")}
                    </td>
                    <td
                      className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap max-w-[150px] overflow-hidden text-ellipsis"
                      title={
                        fee?.classes && fee.classes.length > 0
                          ? (fee.classes as any[])
                              .map((c: any) => c.name)
                              .join(", ")
                          : "All Classes"
                      }
                    >
                      {fee?.classes && fee.classes.length > 0
                        ? (fee.classes as any[])
                            .map((c: any) => c.name)
                            .join(", ")
                        : "All Classes"}
                    </td>
                    <td
                      className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis"
                      title={fee?.description}
                    >
                      {fee?.description || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {fee?.period?.replace(/_/g, " ")}
                    </td>

                    <td className="px-6 py-4 text-center relative">
                      <button
                        onClick={() => toggleDropdown(fee._id)}
                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {activeDropdown === fee._id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActiveDropdown(null)}
                          />
                          <div className="absolute right-8 top-10 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-20 py-2 animate-in fade-in slide-in-from-top-2">
                            <button
                              onClick={() => handleViewClick(fee)}
                              className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                            >
                              <Eye className="w-4 h-4 mr-3" />
                              View Details
                            </button>
                            <button
                              onClick={() => handleEditClick(fee)}
                              disabled={isFetchingPaymentItem}
                              className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors disabled:opacity-50"
                            >
                              <Pencil className="w-4 h-4 mr-3" />
                              {isFetchingPaymentItem
                                ? "Loading..."
                                : "Edit Fee"}
                            </button>
                            <div className="h-px bg-gray-100 my-1 w-full" />
                            <button
                              onClick={() => handleDeleteClick(fee)}
                              className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 mr-3" />
                              Delete Fee
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isEditModalOpen && editFeeData && (
        <CreateFeeModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          isEdit={true}
          initialData={editFeeData}
          paymentItemId={editFeeData._id}
        />
      )}

      {isViewModalOpen && viewFeeData && (
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden bg-white border-none shadow-2xl">
            <div className="bg-linear-to-br from-purple-600 to-indigo-700 p-8 text-white relative">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition duration-200"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <h2 className="text-3xl font-bold mb-2">{viewFeeData.name}</h2>
              <div className="flex items-center gap-3">
                <span className="text-xl font-medium bg-white/20 px-3 py-1 rounded-full border border-white/30 backdrop-blur-sm">
                  ₦{viewFeeData.amount?.toLocaleString()}
                </span>
                <span className="text-sm px-3 py-1.5 bg-indigo-900/40 rounded-full font-medium tracking-wide">
                  {viewFeeData.period?.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            {/* Modal Body Info */}
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Applicable To
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {viewFeeData.applicableTo?.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Due Date
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {viewFeeData.dueDate
                      ? new Date(viewFeeData.dueDate).toLocaleDateString(
                          undefined,
                          { year: "numeric", month: "short", day: "numeric" },
                        )
                      : "N/A"}
                  </p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">
                    Applies to Classes
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {viewFeeData.classes && viewFeeData.classes.length > 0 ? (
                      (viewFeeData.classes as any[]).map((c: any) => (
                        <span
                          key={c._id}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200"
                        >
                          {c.name}
                        </span>
                      ))
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium border border-gray-200">
                        All Classes
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 text-left">
                  Description
                </p>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {viewFeeData.description ||
                    "No description provided for this fee item."}
                </p>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleEditClick(viewFeeData);
                  }}
                  className="w-full flex items-center justify-center py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-800 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  <Pencil className="w-5 h-5 mr-2" />
                  Edit This Fee
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {isDeleteModalOpen && deleteFeeData && (
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader className="mb-4">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <DialogTitle className="text-xl font-bold text-center text-gray-900">
                Delete Fee Item?
              </DialogTitle>
            </DialogHeader>
            <div className="text-center text-gray-600 mb-8">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                {deleteFeeData.name}
              </span>
              ? This action cannot be undone.
            </div>
            <DialogFooter className="flex gap-3 sm:justify-center w-full">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-sm"
              >
                Delete Fee
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
