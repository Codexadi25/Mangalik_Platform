import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

/** Fetches the superadmin-controlled ad configuration (Google AdSense / custom banners). */
export const fetchAdsConfig = createAsyncThunk("ads/fetch", async () => {
  const { data } = await api.get("/ads/config");
  return data.data;
});

const adsSlice = createSlice({
  name: "ads",
  initialState: { config: null, status: "idle" },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchAdsConfig.fulfilled, (state, action) => {
      state.config = action.payload;
      state.status = "succeeded";
    });
  },
});

export default adsSlice.reducer;
