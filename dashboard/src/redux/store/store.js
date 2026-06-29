import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/authSlice";
import couponReducer from "../slices/couponSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    coupon: couponReducer,
  },
});
