import { ApiEndpoints } from "@/utils/endpoints";
import apiSlice from "..";
import { methods } from "@/utils/methods";

export interface ResendParentInviteRequest {
  email: string;
}

export interface ResendParentInviteResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    isRegistered: boolean;
    school: string;
    children: string[];
    createdAt: string;
    updatedAt: string;
  };
}

export const parentApi = apiSlice.injectEndpoints({
  overrideExisting: true,

  endpoints: (builder) => ({
    resendParentInvite: builder.mutation<
      ResendParentInviteResponse,
      ResendParentInviteRequest
    >({
      query: (body) => ({
        url: ApiEndpoints.parent.resendInvite,
        method: methods.POST,
        body,
      }),
    }),
  }),
});

export const { useResendParentInviteMutation } = parentApi;
