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

    updagteClass: builder.mutation<GetAllClassesResponse, CreateClassRequest>({
      query: ({ id, ...request }) => ({
        url: ApiEndpoints.classes.updateClass(id as string),
        method: methods.PATCH,
        body: request,
      }),
      invalidatesTags: ["classes"],
    }),
  }),
});

export const {
  useGetAllClassesQuery,
  useCreateClassMutation,
  useUpdagteClassMutation,
} = classesApi;
