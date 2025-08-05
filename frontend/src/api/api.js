import axios from "axios";
import { getToken } from "../utils/authHelpers";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Automatically attach Authorization header with Bearer token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Automatically log out if token is expired or invalid
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthError =
      error.response &&
      (
        error.response.status === 401 ||
        error.response.data?.message === "Invalid token" ||
        error.response.data?.message === "jwt expired" ||
        error.response.data?.message === "Authorization header missing" ||
        error.response.data?.message?.toLowerCase().includes("unauthorized")
      );

    if (isAuthError) {
      // Remove tokens/user and redirect to login page
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.location.href = "/login";
      // Optionally, display a toast: alert("Session expired. Please log in again.");
    }
    return Promise.reject(error);
  }
);

export default api;
