import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchMyOrders = createAsyncThunk("order/fetchMyOrders", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/orders/my");
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch orders");
  }
});

export const fetchOrderById = createAsyncThunk("order/fetchOrderById", async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/orders/${id}`);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch order details");
  }
});

export const replaceOrder = createAsyncThunk("order/replaceOrder", async ({ id, reason }, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/orders/${id}/replace`, { reason });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to request replacement");
  }
});

const orderSlice = createSlice({
  name: "order",
  initialState: {
    orders: [],
    currentOrder: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.pending, (state) => { state.isLoading = true; })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrderById.pending, (state) => { state.isLoading = true; })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(replaceOrder.fulfilled, (state, action) => {
        if (state.currentOrder?._id === action.payload._id) {
          state.currentOrder = action.payload;
        }
        const idx = state.orders.findIndex(o => o._id === action.payload._id);
        if (idx !== -1) {
          state.orders[idx] = action.payload;
        }
      });
  }
});

export const { clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
