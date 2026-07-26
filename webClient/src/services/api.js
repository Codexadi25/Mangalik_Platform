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
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error;

    if (response?.status === 401 && !config._retried && config.url && !config.url.includes("/auth/refresh")) {
      config._retried = true;

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            config.headers.Authorization = `Bearer ${token}`;
            return api(config);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        const storedRefreshToken = localStorage.getItem("refreshToken");
        const { data } = await axios.post(
          (import.meta.env.VITE_API_BASE_URL || "https://api.mangalik.store/api") + "/auth/refresh",
          { refreshToken: storedRefreshToken },
          {
            headers: { "x-refresh-token": storedRefreshToken },
            withCredentials: true
          }
        );
        const newToken = data.data.accessToken;
        setAccessToken(newToken);
        processQueue(null, newToken);

        config.headers.Authorization = `Bearer ${newToken}`;
        return api(config);
      } catch (refreshError) {
        setAccessToken(null);
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
