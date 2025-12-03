/*eslint-disable @typescript-eslint/no-unused-vars */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "./store";
import { ApiEndpoints } from "@/utils/endpoints";

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

const apiSlice = createApi({
  baseQuery: baseQuery,
  endpoints: (_) => ({}),
});

export default apiSlice;
