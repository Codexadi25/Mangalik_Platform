import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/authSlice";
import cartReducer from "../slices/cartSlice";
import productReducer from "../slices/productSlice";
import adsReducer from "../slices/adsSlice";
import orderReducer from "../slices/orderSlice";
import userReducer from "../slices/userSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productReducer,
    ads: adsReducer,
    order: orderReducer,
    user: userReducer,
  },
});
