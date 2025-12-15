import { ApiEndpoints } from "@/utils/endpoints";
import apiSlice from "..";
import { QueryHelper } from "@/utils/functions";
import { GetPaymentsSummaryResponse } from "@/@types/transaction";
import { methods } from "@/utils/methods";
import { CreateStudentRequest } from "@/@types/student";

export const studentApi = apiSlice.injectEndpoints({
  overrideExisting: true,

  endpoints: (builder) => ({
    getAllStudent: builder.query<
      GetPaymentsSummaryResponse,
      { schoolId: string }
    >({
      query: ({ schoolId }) => ApiEndpoints.student.getAllStudent(schoolId),
      providesTags: ["students"],
    }),

    createStudent: builder.mutation<any, CreateStudentRequest>({
      query: (request) => ({
        url: ApiEndpoints.student.createStudent,
        method: methods.POST,
        body: request,
      }),
      invalidatesTags: ["students"],
    }),
  }),
});

export const { useGetAllStudentQuery, useCreateStudentMutation } = studentApi;
