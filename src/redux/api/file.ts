import { ApiEndpoints } from "@/utils/endpoints";
import apiSlice from "..";
import { FileUploadRequest, FileUploadResponse } from "@/@types/school";

export const fileApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    uploadFile: builder.mutation<FileUploadResponse, FileUploadRequest>({
      query: (body) => ({
        url: ApiEndpoints.file.uploadFile,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useUploadFileMutation } = fileApi;
