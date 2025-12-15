/* eslint-disable @typescript-eslint/no-explicit-any */

import { SignInResponse } from "@/@types/auth";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  accessToken: string | null;
  currentUser: SignInResponse["data"]["user"] | null;
}

const initialState: AuthState = {
  accessToken: null,
  currentUser: null,
};

const authSlice = createSlice({
  initialState,
  name: "auth",
  reducers: {
    logout: (state) => {
      state.accessToken = initialState.accessToken;
    },
    setAuth(state, action: PayloadAction<AuthState>) {
      state.accessToken = action.payload.accessToken;
      state.currentUser = action.payload.currentUser;
    },
  },
});

export default authSlice.reducer;
export const { logout, setAuth } = authSlice.actions;
