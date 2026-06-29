import axios from "axios";

/**
 * Centralized API client.
 * - Sends the in-memory access token via Authorization header
 *   (never stored in localStorage — reduces XSS token-theft surface).
 * - Sends httpOnly refresh cookie automatically via withCredentials.
 * - On a 401, attempts exactly one silent refresh before failing,
 *   to avoid infinite retry loops.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://api.mangalik.store/api",
  withCredentials: true,
});

let accessToken = null;
export const setAccessToken = (token) => {
  accessToken = token;
};

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let isRefreshing = false;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error;
    if (response?.status === 401 && !config._retried) {
      config._retried = true;
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const { data } = await api.post("/auth/refresh");
          setAccessToken(data.data.accessToken);
        } catch {
          setAccessToken(null);
        } finally {
          isRefreshing = false;
        }
      }
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
        return api(config);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
