import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchCmsPage = createAsyncThunk(
  "cms/fetchPage",
  async (key, { rejectWithValue }) => {
    try {
      const response = await api.get(`/cms/${key}`);
      return { key, data: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch CMS page");
    }
  }
);

const cmsSlice = createSlice({
  name: "cms",
  initialState: {
    pages: {},
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCmsPage.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCmsPage.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.pages[action.payload.key] = action.payload.data;
      })
      .addCase(fetchCmsPage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default cmsSlice.reducer;
