import { ApiEndpoints } from "@/utils/endpoints";
import apiSlice from "..";
import { QueryHelper } from "@/utils/functions";
import {
  GetTransactionsResponse,
  MakePaymentRequest,
} from "@/@types/transaction";
import { methods } from "@/utils/methods";
import { SmsWalletResponse } from "@/@types/sms";

export const smsApi = apiSlice.injectEndpoints({
  overrideExisting: true,

  endpoints: (builder) => ({
    getSmsMetrics: builder.query<SmsWalletResponse, { schoolId: string }>({
      query: ({ schoolId }) => ApiEndpoints.sms.getSmsWallet(schoolId),
      providesTags: ["sms"],
    }),

    topUpSms: builder.mutation<GetTransactionsResponse, MakePaymentRequest>({
      query: (request) => ({
        url: ApiEndpoints.sms.smsWalletTopUp,
        methods: methods.POST,
        body: request,
      }),

      invalidatesTags: ["sms"],
    }),
  }),
});

export const { useGetSmsMetricsQuery, useTopUpSmsMutation } = smsApi;
