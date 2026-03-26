import { ApiEndpoints } from "@/utils/endpoints";
import apiSlice from "..";
import { methods } from "@/utils/methods";
import { CreateClassRequest, GetAllClassesResponse } from "@/@types/class";

export const classesApi = apiSlice.injectEndpoints({
  overrideExisting: true,

  endpoints: (builder) => ({
    getAllClasses: builder.query<GetAllClassesResponse, void>({
      query: () => ApiEndpoints.classes.getAllClasses,
      providesTags: ["classes"],
    }),

    createClass: builder.mutation<GetAllClassesResponse, CreateClassRequest>({
      query: (request) => ({
        url: ApiEndpoints.classes.createClass,
        method: methods.POST,
        body: request,
      }),
      invalidatesTags: ["classes"],
    }),

    updateClass: builder.mutation<GetAllClassesResponse, CreateClassRequest & { id?: string }>({
      query: ({ id, ...request }) => ({
        url: ApiEndpoints.classes.updateClass(id as string),
        method: methods.PATCH,
        body: request,
      }),
      invalidatesTags: ["classes"],
    }),

    deleteClass: builder.mutation<GetAllClassesResponse, string>({
      query: (id) => ({
        url: ApiEndpoints.classes.deleteClass(id),
        method: methods.DELETE,
      }),
      invalidatesTags: ["classes"],
    }),
  }),
});

export const {
  useGetAllClassesQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
} = classesApi;
