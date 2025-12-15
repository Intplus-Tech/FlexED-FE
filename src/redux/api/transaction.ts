import { ApiEndpoints } from "@/utils/endpoints";
import apiSlice from "..";
import { QueryHelper } from "@/utils/functions";
import {
  CreatePaymentCategory,
  CreatePaymentCategoryResponse,
  CreatePaymentItemRequest,
  GetClassCollectionsSummaryResponse,
  GetPaymentItemsResponse,
  GetTransactionsResponse,
  MakePaymentRequest,
} from "@/@types/transaction";
import { methods } from "@/utils/methods";
import { GetCollectionsTotalsResponse } from "@/@types/dashboard";

export const transactionApi = apiSlice.injectEndpoints({
  overrideExisting: true,

  endpoints: (builder) => ({
    getTransactions: builder.query<
      GetTransactionsResponse,
      { schoolId: string }
    >({
      query: (request) =>
        QueryHelper(ApiEndpoints.payment.getPaymentTransactions, request),
    }),

    getPaymentCategories: builder.query<CreatePaymentCategoryResponse, void>({
      query: () => ApiEndpoints.payment.getPaymentCategories,
      providesTags: ["Transaction"],
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
      invalidatesTags: ["Transaction"],
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
        methods: methods.POST,
        body: request,
      }),

      invalidatesTags: ["Transaction"],
    }),

    getPaymentList: builder.query<GetPaymentItemsResponse, void>({
      query: () => ApiEndpoints.payment.getPaymentItems,
      providesTags: ["Transaction"],
    }),

    getClassCollections: builder.query<
      GetClassCollectionsSummaryResponse,
      void
    >({
      query: () => ApiEndpoints.payment.getClassCollection,
      providesTags: ["Transaction"],
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
  useCreatePaymentItemsMutation,
  useGetClassCollectionsQuery,
} = transactionApi;
