import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchCart = createAsyncThunk("cart/fetch", async () => {
  const { data } = await api.get("/cart");
  // Filter out items where the product was deleted from DB
  const validItems = data.data?.items?.filter(item => item.product != null) || [];
  return { ...data.data, items: validItems };
});

export const addToCart = createAsyncThunk("cart/add", async (payload) => {
  const { data } = await api.post("/cart/add", payload);
  return data.data;
});

const loadCartFromStorage = () => {
  try {
    const serialized = localStorage.getItem("mangalik_cart");
    return serialized ? JSON.parse(serialized) : [];
  } catch (e) {
    return [];
  }
};

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: loadCartFromStorage(), status: "idle" },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        localStorage.setItem("mangalik_cart", JSON.stringify(state.items));
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        localStorage.setItem("mangalik_cart", JSON.stringify(state.items));
      });
  },
});

export default cartSlice.reducer;
