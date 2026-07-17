import axios from "axios";
import {
  MOCK_ADMIN,
  MOCK_ANALYTICS,
  MOCK_DASHBOARD,
  MOCK_HISTORY,
  MOCK_HISTORY_ITEMS,
  MOCK_MODEL_INFO,
  MOCK_USER,
  mockExplainability,
  mockPredict,
} from "./mockData";

// Demo mode: when true, all API calls resolve with mock data so the UI
// is fully browsable without a running FastAPI backend. Flip this to
// `false` (or set VITE_DEMO_MODE=false) once the backend is reachable.
export const DEMO_MODE =
  (import.meta.env.VITE_DEMO_MODE ?? "false").toString() !== "false";

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

// ---------- helpers ----------
const wait = (ms = 350) => new Promise((r) => setTimeout(r, ms));
const ok = async (data, ms) => {
  await wait(ms);
  return { data };
};

// ---------- Auth ----------
export const registerUser = (payload) =>
  DEMO_MODE
    ? ok({ access_token: "demo-token", token_type: "bearer", user: { ...MOCK_USER, ...payload } })
    : api.post("/auth/register", payload);

export const loginUser = (payload) =>
  DEMO_MODE
    ? ok({ access_token: "demo-token", token_type: "bearer", user: { ...MOCK_USER, username: payload?.username || MOCK_USER.username } })
    : api.post("/auth/login", payload);

export const getProfile = () =>
  DEMO_MODE ? ok(MOCK_USER, 150) : api.get("/auth/profile");

export const updateProfile = (payload) =>
  DEMO_MODE ? ok({ ...MOCK_USER, ...payload }) : api.put("/auth/profile", payload);

export const changePassword = (payload) =>
  DEMO_MODE ? ok({ success: true }) : api.put("/auth/change-password", payload);

// ---------- Prediction ----------
export const predictImage = (formData) =>
  DEMO_MODE
    ? ok(mockPredict(), 900)
    : api.post("/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

export const getExplainability = (predictionId) =>
  DEMO_MODE ? ok(mockExplainability(predictionId), 600) : api.post(`/explainability/${predictionId}`);

// ---------- History ----------
export const getHistory = (params) => {
  if (!DEMO_MODE) return api.get("/history", { params });
  const page = params?.page || 1;
  const pageSize = params?.page_size || params?.limit || 10;
  const start = (page - 1) * pageSize;
  const items = MOCK_HISTORY_ITEMS.slice(start, start + pageSize);
  return ok({ ...MOCK_HISTORY, items, page, page_size: pageSize });
};

export const getHistoryItem = (id) => {
  if (!DEMO_MODE) return api.get(`/history/${id}`);
  const item =
    MOCK_HISTORY_ITEMS.find((h) => String(h.id) === String(id)) || MOCK_HISTORY_ITEMS[0];
  return ok(item);
};

export const deleteHistoryItem = (id) =>
  DEMO_MODE ? ok({ success: true, id }) : api.delete(`/history/${id}`);

// ---------- Analytics ----------
export const getDashboardStats = () =>
  DEMO_MODE ? ok(MOCK_DASHBOARD) : api.get("/dashboard");

export const getAnalytics = () =>
  DEMO_MODE ? ok(MOCK_ANALYTICS) : api.get("/analytics");

// ---------- Model ----------
export const getModelInfo = () =>
  DEMO_MODE ? ok(MOCK_MODEL_INFO) : api.get("/model/info");

// ---------- Admin ----------
export const getAdminStats = () =>
  DEMO_MODE ? ok(MOCK_ADMIN) : api.get("/admin/stats");
