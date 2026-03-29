import { ApiEndpoints } from "@/utils/endpoints";
import apiSlice from "..";
import { GetPaymentsSummaryResponse } from "@/@types/transaction";
import { QueryHelper } from "@/utils/functions";
import { SchoolProfileResponse, UpdateSchoolRequest, InviteStaffRequest, UpdateStaffRequest, StaffResponse, AcceptInviteRequest, InviteDetailsResponse, GetAllStaffResponse } from "@/@types/school";
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
      GetAllStaffResponse,
      { limit?: string; page?: string; search?: string }
    >({
      query: (request) =>
        QueryHelper(ApiEndpoints.school.getSchoolStaff, request),
      providesTags: ["staff"],
    }),
    inviteStaff: builder.mutation<StaffResponse, InviteStaffRequest>({
      query: (request) => ({
        url: ApiEndpoints.schoolStaff.inviteStaff,
        method: methods.POST,
        body: request,
      }),
      invalidatesTags: ["staff"],
    }),
    updateStaff: builder.mutation<StaffResponse, { staffId: string; data: UpdateStaffRequest }>({
      query: ({ staffId, data }) => ({
        url: ApiEndpoints.schoolStaff.updateStaff(staffId),
        method: methods.PATCH,
        body: data,
      }),
      invalidatesTags: ["staff"],
    }),
    deleteStaff: builder.mutation<{ success: boolean; message: string }, string>({
      query: (staffId) => ({
        url: ApiEndpoints.schoolStaff.deleteStaff(staffId),
        method: methods.DELETE,
      }),
      invalidatesTags: ["staff"],
    }),
    acceptInvite: builder.mutation<any, AcceptInviteRequest>({
      query: (request) => ({
        url: ApiEndpoints.schoolStaff.acceptInvite,
        method: methods.POST,
        body: request,
      }),
    }),
    getInviteDetails: builder.query<InviteDetailsResponse, string>({
      query: (token) => `${ApiEndpoints.schoolStaff.getInviteDetails}?token=${token}`,
    }),
  }),
});

export const {
  useGetSchoolMetricsQuery,
  useGetAllStaffQuery,
  useGetShoolProfileQuery,
  useUpdateSchoolMutation,
  useInviteStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
  useAcceptInviteMutation,
  useGetInviteDetailsQuery,
} = schoolApi;
