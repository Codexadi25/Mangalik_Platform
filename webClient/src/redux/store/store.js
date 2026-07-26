import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web

import authReducer from "../slices/authSlice";
import cartReducer from "../slices/cartSlice";
import productReducer from "../slices/productSlice";
import adsReducer from "../slices/adsSlice";
import orderReducer from "../slices/orderSlice";
import userReducer from "../slices/userSlice";
import cmsReducer from "../slices/cmsSlice";
import categoryReducer from "../slices/categorySlice";

const persistConfig = {
  key: "mangalik_root",
  storage,
  whitelist: ["cms", "category"], // Only persist these slices
};

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  products: productReducer,
  ads: adsReducer,
  order: orderReducer,
  user: userReducer,
  cms: cmsReducer,
  category: categoryReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
