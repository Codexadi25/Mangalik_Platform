import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { setAccessToken } from "../../services/api";

export const firebaseLoginThunk = createAsyncThunk(
  "auth/firebaseLogin",
  async (idToken, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/firebase-login", { idToken });
      setAccessToken(data.data.accessToken);
      return data.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed.");
    }
  }
);
export const localLoginThunk = createAsyncThunk(
  "auth/localLogin",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/local-login", { email, password });
      setAccessToken(data.data.accessToken);
      return data.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed.");
    }
  }
);

export const fetchMeThunk = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/auth/me");
      return data.data;
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data?.message || "Failed to load user info",
        status: err.response?.status
      });
    }
  }
);

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  await api.post("/auth/logout");
  setAccessToken(null);
  localStorage.clear();
  sessionStorage.clear();
});

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, mockRole: null, status: "idle", error: null },
  reducers: {
    setMockRole: (state, action) => {
      state.mockRole = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(firebaseLoginThunk.fulfilled, (state, action) => { state.user = action.payload; state.status = "succeeded"; })
      .addCase(firebaseLoginThunk.rejected, (state, action) => { state.error = action.payload; state.status = "failed"; })
      .addCase(fetchMeThunk.pending, (state) => { state.status = "loading"; })
      .addCase(fetchMeThunk.fulfilled, (state, action) => { state.user = action.payload; state.status = "succeeded"; })
      .addCase(fetchMeThunk.rejected, (state, action) => {
        state.status = "failed";
        if (action.payload?.status === 401 || action.payload?.status === 403) {
          state.user = null;
        }
      })
      .addCase(localLoginThunk.fulfilled, (state, action) => { state.user = action.payload; state.status = "succeeded"; })
      .addCase(localLoginThunk.rejected, (state, action) => { state.error = action.payload; state.status = "failed"; })
      .addCase(logoutThunk.fulfilled, (state) => { state.user = null; state.status = "idle"; });
  },
});

export const { setMockRole, setUser } = authSlice.actions;
export default authSlice.reducer;
