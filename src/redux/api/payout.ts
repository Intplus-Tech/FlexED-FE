import { ApiEndpoints } from "@/utils/endpoints";
import apiSlice from "..";
import { QueryHelper } from "@/utils/functions";
import { methods } from "@/utils/methods";
import {
  GetPayoutsResponse,
  GetPayoutByIdResponse,
  GetSchoolWalletResponse,
  GetSettlementAccountsResponse,
  GetWalletLedgerResponse,
  SettlementAccount,
  SchoolWallet,
  Payout,
  PayoutStatus,
  PaginationMeta,
  WalletLedgerEntry,
  WalletLedgerType,
  CreatePayoutRequest,
} from "@/@types/payout";

export const payoutApi = apiSlice.injectEndpoints({
  overrideExisting: true,

  endpoints: (builder) => ({
    getPayouts: builder.query<
      { data: Payout[]; pagination: PaginationMeta },
      { page?: number; limit?: number; status?: PayoutStatus }
    >({
      query: (request) => QueryHelper(ApiEndpoints.payout.getPayouts, request),
      transformResponse: (response: GetPayoutsResponse) => response.data,
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

    getWalletLedger: builder.query<
      { data: WalletLedgerEntry[]; pagination: PaginationMeta },
      { page?: number; limit?: number; type?: WalletLedgerType }
    >({
      query: (request) =>
        QueryHelper(ApiEndpoints.payout.getWalletLedger, request),
      transformResponse: (response: GetWalletLedgerResponse) => response.data,
      providesTags: ["Payout"],
    }),

    getSettlementAccounts: builder.query<SettlementAccount[], string>({
      query: (schoolId) =>
        ApiEndpoints.settlementAccount.getSchoolAccounts(schoolId),
      transformResponse: (response: GetSettlementAccountsResponse) =>
        response.data,
      providesTags: ["SettlementAccount"],
    }),

    createPayout: builder.mutation<Payout, CreatePayoutRequest>({
      query: (body) => ({
        url: ApiEndpoints.payout.createPayout,
        method: methods.POST,
        body,
      }),
      transformResponse: (response: GetPayoutByIdResponse) => response.data,
      invalidatesTags: ["Payout"],
    }),
  }),
});

export const {
  useGetPayoutsQuery,
  useGetPayoutByIdQuery,
  useGetSchoolWalletQuery,
  useGetWalletLedgerQuery,
  useGetSettlementAccountsQuery,
  useCreatePayoutMutation,
} = payoutApi;
