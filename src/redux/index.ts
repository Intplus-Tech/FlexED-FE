/* eslint-disable @typescript-eslint/no-unused-vars */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { RootState } from "./store";
import { ApiEndpoints } from "@/utils/endpoints";
import { signOut } from "next-auth/react";

const baseQuery = fetchBaseQuery({
  baseUrl: ApiEndpoints.baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).authState.accessToken;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithAuthRedirect: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (
    result.error &&
    (result.error.status === 401 || result.error.status === 403)
  ) {
    if (typeof window !== "undefined") {
      signOut();
      window.location.href = "/auth/sign-in";
    }
  }

  return result;
};

const apiSlice = createApi({
  baseQuery: baseQueryWithAuthRedirect,
  tagTypes: ["Transaction", "sms", "students", "academicSession", "classes"],
  endpoints: () => ({}),
});

export default apiSlice;
