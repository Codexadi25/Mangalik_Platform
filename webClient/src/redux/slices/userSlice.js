import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchProfile = createAsyncThunk("user/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/auth/me");
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch profile");
  }
});

export const updateProfile = createAsyncThunk("user/updateProfile", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.patch("/users/me", payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to update profile");
  }
});

export const toggleWishlist = createAsyncThunk("user/toggleWishlist", async (productId, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/users/me/wishlist/${productId}`);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to update wishlist");
  }
});

const userSlice = createSlice({
  name: "user",
  initialState: {
    profile: null,
    wishlist: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => { state.isLoading = true; })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.wishlist = action.payload.wishlist || [];
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.wishlist = action.payload;
      });
  }
});

export default userSlice.reducer;
