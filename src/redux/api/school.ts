import { ApiEndpoints } from "@/utils/endpoints";
import apiSlice from "..";
import { QueryHelper } from "@/utils/functions";
import { GetPaymentsSummaryResponse } from "@/@types/transaction";
import { methods } from "@/utils/methods";

export const schoolApi = apiSlice.injectEndpoints({
  overrideExisting: true,

  endpoints: (builder) => ({
    getSchoolMetrics: builder.query<
      GetPaymentsSummaryResponse,
      { schoolId: string }
    >({
      query: ({ schoolId }) => ApiEndpoints.school.getSchoolMetrics(schoolId),
    }),

    getAllStaff: builder.query<GetPaymentsSummaryResponse, void>({
      query: () => ApiEndpoints.school.getSchoolStaff,
      providesTags: ["staff"],
    }),
  }),
});

export const { useGetSchoolMetricsQuery } = schoolApi;
