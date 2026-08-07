import { ApiEndpoints } from "@/utils/endpoints";
import apiSlice from "..";
import { QueryHelper } from "@/utils/functions";
import { methods } from "@/utils/methods";
import {
  GetParentWalletResponse,
  GetParentWalletLedgerResponse,
  ParentWallet,
  ParentWalletLedgerEntry,
  ParentWalletLedgerPagination,
  TopUpParentWalletRequest,
  TopUpParentWalletResponse,
  ParentWalletTopUpResult,
  BulkTopUpRequest,
  BulkTopUpResponse,
  BulkTopUpResult,
  WalletLedgerType,
  WalletLedgerReason,
} from "@/@types/parent-wallet";

export const parentWalletApi = apiSlice.injectEndpoints({
  overrideExisting: true,

  endpoints: (builder) => ({
    getParentWallet: builder.query<ParentWallet, string>({
      query: (parentId) => ApiEndpoints.parentWallet.getWallet(parentId),
      transformResponse: (response: GetParentWalletResponse) => response.data,
      providesTags: ["ParentWallet"],
    }),

    getParentWalletLedger: builder.query<
      { data: ParentWalletLedgerEntry[]; pagination: ParentWalletLedgerPagination },
      {
        parentId: string;
        page?: number;
        limit?: number;
        type?: WalletLedgerType;
        reason?: WalletLedgerReason;
      }
    >({
      query: ({ parentId, ...params }) =>
        QueryHelper(ApiEndpoints.parentWallet.getWalletLedger(parentId), params),
      transformResponse: (response: GetParentWalletLedgerResponse) => response.data,
      providesTags: ["ParentWallet"],
    }),

    topUpParentWallet: builder.mutation<
      ParentWalletTopUpResult,
      { parentId: string } & TopUpParentWalletRequest
    >({
      query: ({ parentId, ...body }) => ({
        url: ApiEndpoints.parentWallet.topUp(parentId),
        method: methods.POST,
        body,
      }),
      transformResponse: (response: TopUpParentWalletResponse) => response.data,
      invalidatesTags: ["ParentWallet"],
    }),

    bulkTopUpParentWallets: builder.mutation<BulkTopUpResult, BulkTopUpRequest>({
      query: (body) => ({
        url: ApiEndpoints.parentWallet.topUpBulk,
        method: methods.POST,
        body,
      }),
      transformResponse: (response: BulkTopUpResponse) => response.data,
      invalidatesTags: ["ParentWallet"],
    }),
  }),
});

export const {
  useGetParentWalletQuery,
  useGetParentWalletLedgerQuery,
  useTopUpParentWalletMutation,
  useBulkTopUpParentWalletsMutation,
} = parentWalletApi;
