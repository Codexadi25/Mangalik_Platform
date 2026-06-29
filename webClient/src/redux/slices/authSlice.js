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

export const localRegisterThunk = createAsyncThunk(
  "auth/localRegister",
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/local-register", { name, email, password });
      setAccessToken(data.data.accessToken);
      return data.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Registration failed.");
    }
  }
);

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  await api.post("/auth/logout");
  setAccessToken(null);
});

export const fetchMeThunk = createAsyncThunk("auth/me", async () => {
  const { data } = await api.get("/auth/me");
  return data.data;
});

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, status: "idle", error: null },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(firebaseLoginThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(firebaseLoginThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(firebaseLoginThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(localLoginThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(localLoginThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(localLoginThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(localRegisterThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(localRegisterThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(localRegisterThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(fetchMeThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMeThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(fetchMeThunk.rejected, (state, action) => {
        state.status = "failed";
        state.user = null;
      });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
