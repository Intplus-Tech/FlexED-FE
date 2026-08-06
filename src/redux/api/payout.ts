import { ApiEndpoints } from "@/utils/endpoints";
import apiSlice from "..";
import { QueryHelper } from "@/utils/functions";
import { methods } from "@/utils/methods";
import {
  GetPayoutsResponse,
  GetPayoutByIdResponse,
  GetSchoolWalletResponse,
  GetSettlementAccountsResponse,
  SettlementAccount,
  SchoolWallet,
  Payout,
  CreatePayoutRequest,
} from "@/@types/payout";

export const payoutApi = apiSlice.injectEndpoints({
  overrideExisting: true,

  endpoints: (builder) => ({
    getPayouts: builder.query<
      GetPayoutsResponse,
      { page?: number; limit?: number; search?: string }
    >({
      query: (request) =>
        QueryHelper(ApiEndpoints.payout.getPayouts, request),
      providesTags: ["Payout"],
    }),

    getPayoutById: builder.query<Payout, string>({
      query: (id) => ApiEndpoints.payout.getPayoutById(id),
      transformResponse: (response: GetPayoutByIdResponse) => response.data,
      providesTags: ["Payout"],
    }),

    getSchoolWallet: builder.query<SchoolWallet, void>({
      query: () => ApiEndpoints.payout.getWallet,
      transformResponse: (response: GetSchoolWalletResponse) => response.data,
      providesTags: ["Payout"],
    }),

    getSettlementAccounts: builder.query<SettlementAccount[], string>({
      query: (schoolId) => ApiEndpoints.settlementAccount.getSchoolAccounts(schoolId),
      transformResponse: (response: GetSettlementAccountsResponse) => response.data,
      providesTags: ["SettlementAccount"],
    }),

    createPayout: builder.mutation<any, CreatePayoutRequest>({
      query: (body) => ({
        url: ApiEndpoints.payout.createPayout,
        method: methods.POST,
        body,
      }),
      invalidatesTags: ["Payout"],
    }),
  }),
});

export const {
  useGetPayoutsQuery,
  useGetPayoutByIdQuery,
  useGetSchoolWalletQuery,
  useGetSettlementAccountsQuery,
  useCreatePayoutMutation,
} = payoutApi;
