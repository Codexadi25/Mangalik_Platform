import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchCoupons = createAsyncThunk("coupon/fetchCoupons", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/coupons");
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch coupons");
  }
});

export const createCoupon = createAsyncThunk("coupon/createCoupon", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/coupons", payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to create coupon");
  }
});

export const toggleCoupon = createAsyncThunk("coupon/toggleCoupon", async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/coupons/${id}/toggle`);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to toggle coupon");
  }
});

const couponSlice = createSlice({
  name: "coupon",
  initialState: {
    coupons: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoupons.pending, (state) => { state.isLoading = true; })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.coupons = action.payload;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.coupons.unshift(action.payload);
      })
      .addCase(toggleCoupon.fulfilled, (state, action) => {
        const idx = state.coupons.findIndex(c => c._id === action.payload._id);
        if (idx !== -1) {
          state.coupons[idx] = action.payload;
        }
      });
  }
});

export default couponSlice.reducer;
