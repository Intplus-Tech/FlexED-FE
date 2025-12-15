import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducerer from "@/redux/slice/auth";
import apiSlice from ".";
import { middleware } from "./middleware";

export const store = configureStore({
  reducer: {
    authState: authReducerer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([...middleware, apiSlice.middleware]),
  devTools: true,
});

setupListeners(store.dispatch);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
