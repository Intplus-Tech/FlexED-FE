"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreatePaymentCategoryMutation } from "@/redux/api/transaction";
import { showerror, showsuccess } from "@/utils/toast";
import { Loader } from "lucide-react";

const feeCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().min(1, "Description is required"),
});

type FeeCategoryFormData = z.infer<typeof feeCategorySchema>;

interface CreateFeeCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateFeeCategoryModal({
  open,
  onOpenChange,
}: CreateFeeCategoryModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeeCategoryFormData>({
    resolver: zodResolver(feeCategorySchema),
  });

  const [createPaymentCategory, { isLoading }] =
    useCreatePaymentCategoryMutation();

  const onSubmit = async (data: FeeCategoryFormData) => {
    try {
      const res = await createPaymentCategory(data).unwrap();
      showsuccess(res?.message);
      reset();
      onOpenChange(false);
    } catch (error: any) {
      showerror(error?.data?.message);
    }
  };

  const handleReset = () => {
    reset();
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Fee Category
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Category Name
            </label>
            <input
              id="name"
              type="text"
              {...register("name")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={5}
              placeholder="7 days before due date"
              {...register("description")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
            />
            {errors.description && (
              <p className="text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              className="rounded-md bg-purple-600 px-6 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              {isLoading ? (
                <Loader className="mx-auto animate-spin" />
              ) : (
                "Create Category"
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
