import { ApiEndpoints } from "@/utils/endpoints";
import apiSlice from "..";
import { methods } from "@/utils/methods";
import {
  SmsWalletResponse,
  InitiateSmsTopupRequest,
  InitiateSmsTopupResponse,
} from "@/@types/sms";

export const smsApi = apiSlice.injectEndpoints({
  overrideExisting: true,

  endpoints: (builder) => ({
    getSmsMetrics: builder.query<SmsWalletResponse, { schoolId: string }>({
      query: ({ schoolId }) => ApiEndpoints.sms.getSmsWallet(schoolId),
      providesTags: ["sms"],
    }),

    initiateSmsTopup: builder.mutation<
      InitiateSmsTopupResponse,
      InitiateSmsTopupRequest
    >({
      query: (request) => ({
        url: ApiEndpoints.sms.smsTopupInitiate,
        method: methods.POST,
        body: request,
      }),
      invalidatesTags: ["sms"],
    }),
  }),
});

export const { useGetSmsMetricsQuery, useInitiateSmsTopupMutation } = smsApi;
