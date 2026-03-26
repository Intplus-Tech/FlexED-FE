import { ApiEndpoints } from "@/utils/endpoints";
import apiSlice from "..";
import { GetPaymentsSummaryResponse } from "@/@types/transaction";
import { QueryHelper } from "@/utils/functions";
import { SchoolProfileResponse, UpdateSchoolRequest } from "@/@types/school";
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
    getShoolProfile: builder.query<SchoolProfileResponse, void>({
      query: () => ApiEndpoints.school.getSchool,
      providesTags: ["schoolProfile"],
    }),
    updateSchool: builder.mutation<SchoolProfileResponse, UpdateSchoolRequest>({
      query: (request) => ({
        url: ApiEndpoints.school.updateSchool,
        method: methods.PATCH,
        body: request,
      }),
      invalidatesTags: ["schoolProfile"],
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
  useUpdateSchoolMutation,
} = schoolApi;
