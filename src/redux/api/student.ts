/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiEndpoints } from "@/utils/endpoints";
import apiSlice from "..";
import { methods } from "@/utils/methods";
import {
  BulkUploadResponse,
  CreateStudentRequest,
  GetStudentsResponse,
  GetStudentByIdResponse,
} from "@/@types/student";
import { request } from "http";
import { QueryHelper } from "@/utils/functions";

export const studentApi = apiSlice.injectEndpoints({
  overrideExisting: true,

  endpoints: (builder) => ({
    getAllStudent: builder.query<
      GetStudentsResponse,
      {
        schoolId: string;
        limit: number;
        page?: number;
        search?: string;
        classId?: string;
      }
    >({
      query: ({ schoolId, limit, page, search, classId }) =>
        QueryHelper(ApiEndpoints.student.getStudentsBySchool, {
          limit,
          page,
          search,
          classId,
        }),
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

    getStudentById: builder.query<GetStudentByIdResponse, string>({
      query: (id) => ApiEndpoints.student.getStudentById(id),
      transformResponse: (response: { success: boolean; message: string; data: GetStudentByIdResponse }) =>
        response.data,
      providesTags: ["students"],
    }),

    dowloadStudentCSVFormat: builder.mutation<Blob, void>({
      query: () => ({
        url: ApiEndpoints.student.dowloadStudentCSVFormat,
        responseHandler: (response) => response.blob(),
      }),
    }),

    uploadBulkStudent: builder.mutation<
      BulkUploadResponse,
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

    bulkDeleteStudents: builder.mutation<
      { success: boolean; message: string; data?: any },
      { studentIds: string[] }
    >({
      query: (body) => ({
        url: ApiEndpoints.student.bulkDelete,
        method: methods.POST,
        body,
      }),
      invalidatesTags: ["students"],
    }),

    bulkDiscountStudents: builder.mutation<
      { success: boolean; message: string; data?: any },
      {
        studentIds: string[];
        paymentItem: string;
        type: "PERCENTAGE" | "FLAT";
        value: number;
        expiresAt: string;
      }
    >({
      query: (body) => ({
        url: ApiEndpoints.student.bulkDiscount,
        method: methods.POST,
        body,
      }),
      invalidatesTags: ["students"],
    }),

    bulkAssignClass: builder.mutation<
      { success: boolean; message: string },
      { classId: string; studentIds: string[] }
    >({
      query: (body) => ({
        url: ApiEndpoints.student.assignClass,
        method: methods.PATCH,
        body,
      }),
      invalidatesTags: ["students"],
    }),

    addStudentDiscount: builder.mutation<
      { success: boolean; message: string; data?: any },
      {
        studentId: string;
        paymentItem: string;
        type: "PERCENTAGE" | "FLAT";
        value: number;
        expiresAt: string;
      }
    >({
      query: ({ studentId, ...body }) => ({
        url: ApiEndpoints.student.addDiscount(studentId),
        method: methods.POST,
        body,
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
  useBulkDeleteStudentsMutation,
  useBulkDiscountStudentsMutation,
  useBulkAssignClassMutation,
  useAddStudentDiscountMutation,
} = studentApi;
