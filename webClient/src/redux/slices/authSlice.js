import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { setAccessToken } from "../../services/api";

export const firebaseLoginThunk = createAsyncThunk(
  "auth/firebaseLogin",
  async (idToken, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/firebase-login", { idToken });
      setAccessToken(data.data.accessToken);
      if (data.data.refreshToken) {
        localStorage.setItem("refreshToken", data.data.refreshToken);
      }
      return data.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed.");
    }
  }
);
export const localLoginThunk = createAsyncThunk(
  "auth/localLogin",
  async ({ identifier, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/local-login", { identifier, password });
      setAccessToken(data.data.accessToken);
      if (data.data.refreshToken) {
        localStorage.setItem("refreshToken", data.data.refreshToken);
      }
      return data.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed.");
    }
  }
);

export const localRegisterThunk = createAsyncThunk(
  "auth/localRegister",
  async ({ name, identifier, password, referralCode }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/local-register", { name, identifier, password, referralCode });
      setAccessToken(data.data.accessToken);
      if (data.data.refreshToken) {
        localStorage.setItem("refreshToken", data.data.refreshToken);
      }
      return data.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Registration failed.");
    }
  }
);

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  await api.post("/auth/logout");
  setAccessToken(null);
  localStorage.clear();
  sessionStorage.clear();
});

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
        if (action.payload?.status === 401 || action.payload?.status === 403) {
          state.user = null;
        }
      });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
