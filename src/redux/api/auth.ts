import { ApiEndpoints } from "@/utils/endpoints";
import apiSlice from "..";
import {
  CreateSchoolRequest,
  CreateSchoolResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResendOTPRequest,
  ResetPasswordRequest,
  VerifyAccountRequest,
  ChangePasswordRequest,
} from "@/@types/auth";

export const authApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    signUp: builder.mutation<CreateSchoolResponse, CreateSchoolRequest>({
      query: (request) => ({
        url: ApiEndpoints.school.registerSchool,
        method: "POST",
        body: request,
      }),
    }),

    verifyAccount: builder.mutation<CreateSchoolResponse, VerifyAccountRequest>(
      {
        query: (request) => ({
          url: ApiEndpoints.auth.verifyAccount,
          method: "POST",
          body: request,
        }),
      }
    ),

    resendOtp: builder.mutation<CreateSchoolResponse, ResendOTPRequest>({
      query: (request) => ({
        url: ApiEndpoints.auth.resentOtp,
        method: "POST",
        body: request,
      }),
    }),

    forgotPassword: builder.mutation<
      ForgotPasswordResponse,
      ForgotPasswordRequest
    >({
      query: (request) => ({
        url: ApiEndpoints.auth.forgotPassword,
        method: "POST",
        body: request,
      }),
    }),

    resetPassword: builder.mutation<CreateSchoolResponse, ResetPasswordRequest>(
      {
        query: (request) => ({
          url: ApiEndpoints.auth.resetPassword,
          method: "POST",
          body: request,
        }),
      }
    ),
    changePassword: builder.mutation<CreateSchoolResponse, ChangePasswordRequest>(
      {
        query: (request) => ({
          url: ApiEndpoints.auth.changePassword,
          method: "POST",
          body: request,
        }),
      }
    ),
  }),
});

export const {
  useSignUpMutation,
  useVerifyAccountMutation,
  useResendOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
} = authApi;
