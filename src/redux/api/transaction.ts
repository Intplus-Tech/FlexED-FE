import { ApiEndpoints } from "@/utils/endpoints";
import apiSlice from "..";
import { QueryHelper } from "@/utils/functions";
import {
  CreatePaymentCategory,
  CreatePaymentCategoryResponse,
  CreatePaymentItemRequest,
  GetClassCollectionsSummaryResponse,
  GetPaymentItemsResponse,
  GetTransactionChartDataResponse,
  GetTransactionsResponse,
  GetTransactionsByStudentResponse,
  MakePaymentRequest,
  CollectManualPaymentRequest,
  UpdatePaymentItemRequest,
  PaymentItem,
  GetBanksResponse,
  ValidateAccountRequest,
  ValidateAccountResponse,
  CreateSettlementAccountRequest,
  CreateSettlementAccountResponse,
  StudentFeeProfileResponse,
  ManualAllocationRequest,
  ManualAllocationResponse,
  CollectManualPaymentResponse,
} from "@/@types/transaction";
import { methods } from "@/utils/methods";
import { GetCollectionsTotalsResponse } from "@/@types/dashboard";

export const transactionApi = apiSlice.injectEndpoints({
  overrideExisting: true,

  endpoints: (builder) => ({
    getTransactions: builder.query<
      GetTransactionsResponse,
      {
        schoolId: string;
        page?: number;
        limit?: number;
        search?: string;
        academicPeriod?: string;
        classId?: string;
        status?: string;
        category?: string;
      }
    >({
      query: (request) =>
        QueryHelper(ApiEndpoints.payment.getPaymentTransactions, request),
      providesTags: ["Transaction"],
    }),

    getTransactionsByStudent: builder.query<
      GetTransactionsByStudentResponse,
      {
        /** Optional — only honoured as an override for SUPER_ADMIN; school is otherwise resolved from the token. */
        schoolId?: string;
        /** Page of students (a student's payments are never split across pages). */
        page?: number;
        /** Number of students per page (max 100). */
        limit?: number;
        search?: string;
        academicPeriod?: string;
        classId?: string;
        status?: string;
        category?: string;
      }
    >({
      query: (request) =>
        QueryHelper(
          ApiEndpoints.payment.getPaymentTransactionsByStudent,
          request,
        ),
      providesTags: ["Transaction"],
    }),

    getPaymentCategories: builder.query<
      CreatePaymentCategoryResponse,
      { search?: string; limit?: number } | void
    >({
      query: (request) =>
        QueryHelper(ApiEndpoints.payment.getPaymentCategories, request || {}),
      providesTags: ["PaymentCategory"],
    }),

    createPaymentCategory: builder.mutation<
      CreatePaymentCategoryResponse,
      CreatePaymentCategory
    >({
      query: (request) => ({
        url: ApiEndpoints.payment.createPaymentCategory,
        method: methods.POST,
        body: request,
      }),
      invalidatesTags: ["PaymentCategory"],
    }),

    createPaymentItems: builder.mutation<
      CreatePaymentCategoryResponse,
      CreatePaymentItemRequest
    >({
      query: (request) => ({
        url: ApiEndpoints.payment.createPaymentItems,
        method: methods.POST,
        body: request,
      }),
      invalidatesTags: ["Transaction"],
    }),

    getPaymentMetrics: builder.query<GetCollectionsTotalsResponse, void>({
      query: () => ApiEndpoints.payment.getPaymentMetrics,
      providesTags: ["Transaction"],
    }),

    makePayment: builder.mutation<GetTransactionsResponse, MakePaymentRequest>({
      query: (request) => ({
        url: ApiEndpoints.payment.makePayment,
        method: methods.POST,
        body: request,
      }),

      invalidatesTags: ["Transaction"],
    }),

    collectManualPayment: builder.mutation<
      CollectManualPaymentResponse,
      CollectManualPaymentRequest
    >({
      query: (request) => ({
        url: ApiEndpoints.payment.collectManualPayment,
        method: methods.POST,
        body: request,
      }),

      invalidatesTags: ["Transaction"],
    }),

    getPaymentList: builder.query<
      GetPaymentItemsResponse,
      { search?: string; limit?: number; page?: number } | void
    >({
      query: (request) =>
        QueryHelper(ApiEndpoints.payment.getPaymentItems, request || {}),
      providesTags: ["Transaction"],
    }),

    getClassCollections: builder.query<
      GetClassCollectionsSummaryResponse,
      void
    >({
      query: () => ApiEndpoints.payment.getClassCollection,
      providesTags: ["Transaction"],
    }),

    getTransactionChartData: builder.query<
      GetTransactionChartDataResponse,
      { schoolId: string }
    >({
      query: ({ schoolId }) =>
        ApiEndpoints.payment.getTransactionChartData(schoolId),
      providesTags: ["Transaction"],
    }),
    updatePaymentItem: builder.mutation<
      { success: boolean; message: string; data: PaymentItem },
      { paymentItemId: string; body: UpdatePaymentItemRequest }
    >({
      query: ({ paymentItemId, body }) => ({
        url: ApiEndpoints.payment.updatePaymentItem(paymentItemId),
        method: methods.PUT,
        body,
      }),
      invalidatesTags: ["Transaction"],
    }),
    deletePaymentItem: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (paymentItemId) => ({
        url: ApiEndpoints.payment.deletePaymentItem(paymentItemId),
        method: methods.DELETE,
      }),
      invalidatesTags: ["Transaction"],
    }),
    bulkDeleteTransactions: builder.mutation<
      { success: boolean; message: string },
      { transactionIds: string[] }
    >({
      query: (body) => ({
        url: ApiEndpoints.payment.bulkDeleteTransactions,
        method: methods.POST,
        body,
      }),
      invalidatesTags: ["Transaction"],
    }),
    bulkDeletePaymentItems: builder.mutation<
      { success: boolean; message: string },
      { paymentItemIds: string[] }
    >({
      query: (body) => ({
        url: ApiEndpoints.payment.bulkDeletePaymentItems,
        method: methods.POST,
        body,
      }),
      invalidatesTags: ["Transaction"],
    }),
    getPaymentItem: builder.query<
      { success: boolean; message: string; data: PaymentItem },
      string
    >({
      query: (paymentItemId) =>
        ApiEndpoints.payment.getPaymentItem(paymentItemId),
      providesTags: ["Transaction"],
    }),
    getBanks: builder.query<GetBanksResponse, void>({
      query: () => ApiEndpoints.payment.getBanks,
    }),
    validateAccount: builder.mutation<
      ValidateAccountResponse,
      ValidateAccountRequest
    >({
      query: (request) => ({
        url: ApiEndpoints.payment.validateAccount,
        method: methods.POST,
        body: request,
      }),
    }),
    createSettlementAccount: builder.mutation<
      CreateSettlementAccountResponse,
      CreateSettlementAccountRequest
    >({
      query: (request) => ({
        url: ApiEndpoints.payment.createSettlementAccount,
        method: methods.POST,
        body: request,
      }),
      invalidatesTags: ["Transaction", "SettlementAccount"],
    }),

    getStudentFeeProfile: builder.query<StudentFeeProfileResponse, string>({
      query: (studentId) => ApiEndpoints.payment.getStudentFeeProfile(studentId),
      providesTags: ["Transaction"],
    }),

    allocateManualPayment: builder.mutation<
      ManualAllocationResponse,
      ManualAllocationRequest
    >({
      query: (request) => ({
        url: ApiEndpoints.payment.allocateManualPayment,
        method: methods.POST,
        body: request,
      }),
      invalidatesTags: ["Transaction"],
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useGetPaymentMetricsQuery,
  useGetPaymentListQuery,
  useCreatePaymentCategoryMutation,
  useGetPaymentCategoriesQuery,
  useMakePaymentMutation,
  useCollectManualPaymentMutation,
  useCreatePaymentItemsMutation,
  useGetClassCollectionsQuery,
  useGetTransactionChartDataQuery,
  useUpdatePaymentItemMutation,
  useDeletePaymentItemMutation,
  useGetPaymentItemQuery,
  useLazyGetPaymentItemQuery,
  useGetBanksQuery,
  useValidateAccountMutation,
  useCreateSettlementAccountMutation,
  useGetStudentFeeProfileQuery,
  useLazyGetStudentFeeProfileQuery,
  useLazyGetTransactionsQuery,
  useGetTransactionsByStudentQuery,
  useLazyGetTransactionsByStudentQuery,
  useAllocateManualPaymentMutation,
  useBulkDeleteTransactionsMutation,
  useBulkDeletePaymentItemsMutation,
} = transactionApi;
