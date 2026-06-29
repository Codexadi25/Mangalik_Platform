import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchCart = createAsyncThunk("cart/fetch", async () => {
  const { data } = await api.get("/cart");
  return data.data;
});

export const addToCart = createAsyncThunk("cart/add", async (payload) => {
  const { data } = await api.post("/cart/add", payload);
  return data.data;
});

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [], status: "idle" },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
      });
  },
});

export default cartSlice.reducer;
