"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreVertical, Pencil, Trash2, X } from "lucide-react";

import { PaymentItem } from "@/@types/transaction";
import { DataTable } from "@/components/ui/data-table";
import { TableEmptyState } from "@/components/ui/table-empty-state";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ACTIONS_COLUMN_ID, SELECT_COLUMN_ID } from "@/lib/table-column-prefs";
import {
  useBulkDeletePaymentItemsMutation,
  useDeletePaymentItemMutation,
  useLazyGetPaymentItemQuery,
} from "@/redux/api/transaction";
import { formatNaira } from "@/utils/functions";
import { showerror, showsuccess } from "@/utils/toast";

import { CreateFeeModal } from "../add-fee";

const MANIFEST = [
  { key: "name", label: "Fee/Payment Item" },
  { key: "amount", label: "Amount" },
  { key: "applicableTo", label: "Applicable To" },
  { key: "classes", label: "Classes" },
  { key: "description", label: "Description" },
  { key: "period", label: "Tenure" },
];

function classNames(fee: PaymentItem): string {
  return fee?.classes && fee.classes.length > 0
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (fee.classes as any[]).map((c: any) => c.name).join(", ")
    : "All Classes";
}

interface FeeTableProps {
  fees: PaymentItem[];
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  error?: unknown;
  searchQuery?: string;
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  action?: React.ReactNode;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSearch: (term: string) => void;
  onRefresh: () => void;
}

export function FeeTable({
  fees,
  isLoading = false,
  isFetching = false,
  isError = false,
  error,
  searchQuery = "",
  totalCount,
  pageIndex,
  pageSize,
  action,
  onPageChange,
  onPageSizeChange,
  onSearch,
  onRefresh,
}: FeeTableProps) {
  const [viewFeeData, setViewFeeData] = useState<PaymentItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editFeeData, setEditFeeData] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [deleteFeeData, setDeleteFeeData] = useState<PaymentItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  const [deletePaymentItem] = useDeletePaymentItemMutation();
  const [bulkDeletePaymentItems, { isLoading: isBulkDeleting }] =
    useBulkDeletePaymentItemsMutation();
  const [fetchPaymentItem, { isFetching: isFetchingPaymentItem }] =
    useLazyGetPaymentItemQuery();

  const allSelected = fees.length > 0 && selectedIds.length === fees.length;

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : fees.map((fee) => fee._id));
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const confirmBulkDelete = async () => {
    try {
      const res = await bulkDeletePaymentItems({
        paymentItemIds: selectedIds,
      }).unwrap();
      showsuccess(res?.message || "Selected fees deleted successfully");
      setSelectedIds([]);
      setIsBulkDeleteModalOpen(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      showerror(error?.data?.message || "Failed to delete selected fees");
    }
  };

  const handleEditClick = async (fee: PaymentItem) => {
    try {
      const result = await fetchPaymentItem(fee._id).unwrap();
      const data = result.data;
      const mappedData = {
        name: data.name,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        classes: data.classes ? (data.classes as any[]).map((c) => c._id) : [],
        amount: data.amount,
        applicableTo: data.applicableTo,
        students: data.individuals
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (data.individuals as any[]).map((i) =>
              typeof i === "string" ? i : i._id
            )
          : data.students || [],
        category:
          typeof data.category === "object" ? data.category?._id : data.category,
        academicPeriod:
          typeof data.academicPeriod === "object"
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (data.academicPeriod as any)._id
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

  const confirmDelete = async () => {
    if (!deleteFeeData) return;
    try {
      const res = await deletePaymentItem(deleteFeeData._id).unwrap();
      showsuccess(res?.message || "Fee deleted successfully");
      setSelectedIds((prev) => prev.filter((id) => id !== deleteFeeData._id));
      setIsDeleteModalOpen(false);
      setDeleteFeeData(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      showerror(error?.data?.message || "Failed to delete fee");
    }
  };

  const columns = useMemo<ColumnDef<PaymentItem, unknown>[]>(
    () => [
      {
        id: SELECT_COLUMN_ID,
        enableHiding: false,
        header: () => (
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleSelectAll}
            disabled={fees.length === 0}
            aria-label="Select all fees"
            className="size-4 cursor-pointer rounded border-gray-300 accent-purple-500 disabled:cursor-not-allowed"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedIds.includes(row.original._id)}
            onChange={() => toggleSelectRow(row.original._id)}
            aria-label={`Select ${row.original.name}`}
            className="size-4 cursor-pointer rounded border-gray-300 accent-purple-500"
          />
        ),
      },
      {
        id: "name",
        accessorKey: "name",
        header: "Fee/Payment Item",
        cell: ({ row }) => (
          <span className="font-medium text-gray-900">{row.original.name}</span>
        ),
      },
      {
        id: "amount",
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <span className="font-semibold text-gray-900">
            {formatNaira(row.original.amount ?? 0)}
          </span>
        ),
      },
      {
        id: "applicableTo",
        accessorKey: "applicableTo",
        header: "Applicable To",
        cell: ({ row }) => row.original.applicableTo?.replace(/_/g, " "),
      },
      {
        id: "classes",
        accessorKey: "classes",
        header: "Classes",
        cell: ({ row }) => (
          <span
            className="block max-w-[150px] truncate"
            title={classNames(row.original)}
          >
            {classNames(row.original)}
          </span>
        ),
      },
      {
        id: "description",
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <span
            className="block max-w-[200px] truncate"
            title={row.original.description}
          >
            {row.original.description || "—"}
          </span>
        ),
      },
      {
        id: "period",
        accessorKey: "period",
        header: "Tenure",
        cell: ({ row }) => row.original.period?.replace(/_/g, " "),
      },
      {
        id: ACTIONS_COLUMN_ID,
        header: "",
        enableHiding: false,
        cell: ({ row }) => (
          <Popover>
            <PopoverTrigger asChild>
              <button
                aria-label="Fee actions"
                className="cursor-pointer rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <MoreVertical className="size-5" />
              </button>
            </PopoverTrigger>
            {/* A popover, not an absolutely-positioned div: the old menu was
                clipped by the table's scroll container on the last rows. */}
            <PopoverContent align="end" className="w-48 py-2">
              <button
                onClick={() => {
                  setViewFeeData(row.original);
                  setIsViewModalOpen(true);
                }}
                className="flex w-full cursor-pointer items-center px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-purple-50 hover:text-purple-700"
              >
                <Eye className="mr-3 size-4" />
                View Details
              </button>
              <button
                onClick={() => handleEditClick(row.original)}
                disabled={isFetchingPaymentItem}
                className="flex w-full cursor-pointer items-center px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
              >
                <Pencil className="mr-3 size-4" />
                {isFetchingPaymentItem ? "Loading..." : "Edit Fee"}
              </button>
              <div className="my-1 h-px w-full bg-gray-100" />
              <button
                onClick={() => {
                  setDeleteFeeData(row.original);
                  setIsDeleteModalOpen(true);
                }}
                className="flex w-full cursor-pointer items-center px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 className="mr-3 size-4" />
                Delete Fee
              </button>
            </PopoverContent>
          </Popover>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allSelected, fees, selectedIds, isFetchingPaymentItem]
  );

  return (
    <>
      {selectedIds.length > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-purple-100 bg-purple-50 px-6 py-3">
          <p className="text-sm font-medium text-purple-700">
            {selectedIds.length} fee{selectedIds.length > 1 ? "s" : ""} selected
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedIds([])}
              className="cursor-pointer text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
            >
              Clear
            </button>
            <button
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              <Trash2 className="size-4" />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      <DataTable
        title="Fees"
        action={action}
        columns={columns}
        data={fees}
        isLoading={isLoading}
        isRefetching={isFetching && !isLoading}
        isError={isError}
        error={error}
        onRefresh={onRefresh}
        onSearch={onSearch}
        searchPlaceholder="Search fees..."
        serverPagination={{
          totalCount,
          pageIndex,
          pageSize,
          onPageChange,
          onPageSizeChange,
        }}
        empty={
          <TableEmptyState
            title={searchQuery ? "No fees match your search" : "No fees yet"}
            description={
              searchQuery
                ? "Try a different fee name."
                : "Create a fee item to start billing parents for this period."
            }
          />
        }
        fullView={{
          columns,
          manifest: MANIFEST,
          title: "Fees",
          tableId: "fees",
        }}
      />

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
          <DialogContent className="max-w-lg overflow-hidden rounded-2xl border-none bg-white p-0 shadow-2xl">
            <div className="relative bg-linear-to-br from-purple-600 to-indigo-700 p-8 text-white">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="absolute top-4 right-4 cursor-pointer rounded-full bg-white/10 p-2 transition duration-200 hover:bg-white/20"
              >
                <X className="size-5 text-white" />
              </button>
              <h2 className="mb-2 text-3xl font-bold">{viewFeeData.name}</h2>
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xl font-medium backdrop-blur-sm">
                  {formatNaira(viewFeeData.amount ?? 0)}
                </span>
                <span className="rounded-full bg-indigo-900/40 px-3 py-1.5 text-sm font-medium tracking-wide">
                  {viewFeeData.period?.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            <div className="space-y-6 p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Applicable To
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {viewFeeData.applicableTo?.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Due Date
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {viewFeeData.dueDate
                      ? new Date(viewFeeData.dueDate).toLocaleDateString(
                          undefined,
                          { year: "numeric", month: "short", day: "numeric" }
                        )
                      : "N/A"}
                  </p>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Applies to Classes
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {viewFeeData.classes && viewFeeData.classes.length > 0 ? (
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (viewFeeData.classes as any[]).map((c: any) => (
                        <span
                          key={c._id}
                          className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                        >
                          {c.name}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                        All Classes
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <p className="mb-2 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  Description
                </p>
                <p className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
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
                  className="flex w-full cursor-pointer items-center justify-center rounded-xl bg-purple-500 py-3 font-medium text-white shadow-md transition-all hover:bg-purple-800 hover:shadow-lg active:scale-[0.98]"
                >
                  <Pencil className="mr-2 size-5" />
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
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="size-6 text-red-600" />
              </div>
              <DialogTitle className="text-center text-xl font-bold text-gray-900">
                Delete Fee Item?
              </DialogTitle>
            </DialogHeader>
            <div className="mb-8 text-center text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                {deleteFeeData.name}
              </span>
              ? This action cannot be undone.
            </div>
            <DialogFooter className="flex w-full gap-3 sm:justify-center">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 cursor-pointer rounded-xl border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 cursor-pointer rounded-xl bg-red-600 px-4 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-red-700"
              >
                Delete Fee
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {isBulkDeleteModalOpen && (
        <Dialog
          open={isBulkDeleteModalOpen}
          onOpenChange={setIsBulkDeleteModalOpen}
        >
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader className="mb-4">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="size-6 text-red-600" />
              </div>
              <DialogTitle className="text-center text-xl font-bold text-gray-900">
                Delete {selectedIds.length} Fee Item
                {selectedIds.length > 1 ? "s" : ""}?
              </DialogTitle>
            </DialogHeader>
            <div className="mb-8 text-center text-gray-600">
              Are you sure you want to delete the{" "}
              <span className="font-semibold text-gray-900">
                {selectedIds.length} selected fee
                {selectedIds.length > 1 ? "s" : ""}
              </span>
              ? This action cannot be undone.
            </div>
            <DialogFooter className="flex w-full gap-3 sm:justify-center">
              <button
                onClick={() => setIsBulkDeleteModalOpen(false)}
                disabled={isBulkDeleting}
                className="flex-1 cursor-pointer rounded-xl border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                disabled={isBulkDeleting}
                className="flex-1 cursor-pointer rounded-xl bg-red-600 px-4 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isBulkDeleting ? "Deleting..." : "Delete Selected"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
