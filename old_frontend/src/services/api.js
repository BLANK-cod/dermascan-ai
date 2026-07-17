import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("dermascan_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("dermascan_token");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// --- Auth ---
export const registerUser = (payload) => api.post("/auth/register", payload);
export const loginUser = (payload) => api.post("/auth/login", payload);
export const getProfile = () => api.get("/auth/profile");
export const updateProfile = (payload) => api.put("/auth/profile", payload);
export const changePassword = (payload) => api.put("/auth/change-password", payload);

// --- Prediction ---
export const predictImage = (formData) =>
  api.post("/predict", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const getExplainability = (predictionId) =>
  api.post(`/explainability/${predictionId}`);

// --- History ---
export const getHistory = (params) => api.get("/history", { params });
export const getHistoryItem = (id) => api.get(`/history/${id}`);
export const deleteHistoryItem = (id) => api.delete(`/history/${id}`);

// --- Analytics ---
export const getDashboardStats = () => api.get("/dashboard");
export const getAnalytics = () => api.get("/analytics");

// --- Model ---
export const getModelInfo = () => api.get("/model/info");

// --- Admin ---
export const getAdminStats = () => api.get("/admin/stats");
