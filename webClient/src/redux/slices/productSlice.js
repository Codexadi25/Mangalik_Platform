import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchProducts = createAsyncThunk("products/fetch", async (params) => {
  const { data } = await api.get("/products", { params });
  return data;
});

const productSlice = createSlice({
  name: "products",
  initialState: { items: [], pagination: {}, status: "idle" },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      });
  },
});

export default productSlice.reducer;
