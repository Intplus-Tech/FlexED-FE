/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiEndpoints } from "@/utils/endpoints";
import apiSlice from "..";
import { methods } from "@/utils/methods";
import { CreateStudentRequest, GetStudentsResponse } from "@/@types/student";
import { request } from "http";
import { QueryHelper } from "@/utils/functions";

export const studentApi = apiSlice.injectEndpoints({
  overrideExisting: true,

  endpoints: (builder) => ({
    getAllStudent: builder.query<GetStudentsResponse, { schoolId: string,limit:number,page?:number }>({
      query: ({ schoolId,limit,page }) => QueryHelper(ApiEndpoints.student.getAllStudent,{limit,page}),
      providesTags: ["students"],
    }),

    createStudent: builder.mutation<GetStudentsResponse, CreateStudentRequest>({
      query: (request) => ({
        url: ApiEndpoints.student.createStudent,
        method: methods.POST,
        body: request,
      }),
      invalidatesTags: ["students"],
    }),

    updateStudent: builder.mutation<GetStudentsResponse, CreateStudentRequest>({
      query: ({ id, ...request }) => ({
        url: ApiEndpoints.student.updateStudent(id as string),
        method: methods.PATCH,
        body: request,
      }),
      invalidatesTags: ["students"],
    }),

    deleteStudent: builder.mutation<GetStudentsResponse, string>({
      query: (id) => ({
        url: ApiEndpoints.student.deleteStudent(id),
        method: methods.DELETE,
      }),
      invalidatesTags: ["students"],
    }),

    getStudentById: builder.query<GetStudentsResponse, string>({
      query: (id) => ApiEndpoints.student.getStudentById(id),
      providesTags: ["students"],
    }),

    dowloadStudentCSVFormat: builder.mutation<Blob, void>({
      query: () => ({
        url: ApiEndpoints.student.dowloadStudentCSVFormat,
        responseHandler: (response) => response.blob(),
      }),
    }),

    uploadBulkStudent: builder.mutation<
      GetStudentsResponse,
      { classId: string; file: FormData }
    >({
      query: ({ classId, file }) => ({
        url: ApiEndpoints.student.uploadBulkStudent(classId),
        method: methods.POST,
        body: file,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
      invalidatesTags: ["students"],
    }),
  }),
});

export const {
  useGetAllStudentQuery,
  useCreateStudentMutation,
  useGetStudentByIdQuery,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useDowloadStudentCSVFormatMutation,
  useUploadBulkStudentMutation,
} = studentApi;
