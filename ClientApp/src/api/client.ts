import axios from "axios";

/**
 * Shared axios instance for the Task Manager API.
 * Automatically attaches the JWT token from localStorage to every request.
 */
const apiClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Request interceptor – attach Bearer token if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("tm_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor – redirect to /login on 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Clear stale credentials and redirect
      localStorage.removeItem("tm_token");
      localStorage.removeItem("tm_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default apiClient;
