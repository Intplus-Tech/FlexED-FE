import { ApiEndpoints } from "@/utils/endpoints";
import apiSlice from "..";
import { methods } from "@/utils/methods";
import {
  CreateAcademicSessionRequest,
  GetAcademicSessionResponse,
} from "@/@types/academic-session";

export const academicSessionApi = apiSlice.injectEndpoints({
  overrideExisting: true,

  endpoints: (builder) => ({
    getAllAcademicSession: builder.query<GetAcademicSessionResponse, void>({
      query: () => ApiEndpoints.academicSession.getAllAcademicSessions,
      providesTags: ["academicSession"],
    }),

    createAcademicSession: builder.mutation<
      GetAcademicSessionResponse,
      CreateAcademicSessionRequest
    >({
      query: (request) => ({
        url: ApiEndpoints.academicSession.createAcademicSession,
        method: methods.POST,
        body: request,
      }),
      invalidatesTags: ["academicSession"],
    }),

    updateAcademicSession: builder.mutation<
      GetAcademicSessionResponse,
      CreateAcademicSessionRequest
    >({
      query: ({ id, ...request }) => ({
        url: ApiEndpoints.academicSession.updateAcademicSession(id as string),
        method: methods.PATCH,
        body: request,
      }),
      invalidatesTags: ["academicSession"],
    }),

    updateAcademicSessionStatus: builder.mutation<
      GetAcademicSessionResponse,
      { id: string; isActive: boolean }
    >({
      query: ({ id }) => ({
        url: ApiEndpoints.academicSession.setAcademicSessionStatus(id as string),
        method: methods.POST,
      }),
      invalidatesTags: ["academicSession"],
    }),
  }),
});

export const {
  useGetAllAcademicSessionQuery,
  useCreateAcademicSessionMutation,
  useUpdateAcademicSessionStatusMutation,
  useUpdateAcademicSessionMutation,
} = academicSessionApi;
