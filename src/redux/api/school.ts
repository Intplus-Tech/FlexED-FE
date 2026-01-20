import { ApiEndpoints } from "@/utils/endpoints";
import apiSlice from "..";
import { GetPaymentsSummaryResponse } from "@/@types/transaction";
import { QueryHelper } from "@/utils/functions";
import { SchoolProfileResponse } from "@/@types/school";

export const schoolApi = apiSlice.injectEndpoints({
  overrideExisting: true,

  endpoints: (builder) => ({
    getSchoolMetrics: builder.query<
      GetPaymentsSummaryResponse,
      { schoolId: string }
    >({
      query: ({ schoolId }) => ApiEndpoints.school.getSchoolMetrics(schoolId),
    }),
    getShoolProfile: builder.query<SchoolProfileResponse, void>({
      query: () => ApiEndpoints.school.getSchool,
    }),
    getAllStaff: builder.query<
      GetPaymentsSummaryResponse,
      { limit?: string; page?: string; search?: string }
    >({
      query: (request) =>
        QueryHelper(ApiEndpoints.school.getSchoolStaff, request),
      providesTags: ["staff"],
    }),
  }),
});

export const {
  useGetSchoolMetricsQuery,
  useGetAllStaffQuery,
  useGetShoolProfileQuery,
} = schoolApi;
