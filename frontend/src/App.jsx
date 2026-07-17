import { Toaster } from "react-hot-toast";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminPage from "./pages/AdminPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import DashboardPage from "./pages/DashboardPage";
import HistoryPage from "./pages/HistoryPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import ModelInfoPage from "./pages/ModelInfoPage";
import PredictionPage from "./pages/PredictionPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "rgba(17, 26, 46, 0.9)",
                color: "#E6EDF7",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
                borderRadius: "14px",
              },
              success: { iconTheme: { primary: "#14B8A6", secondary: "#0B1220" } },
              error: { iconTheme: { primary: "#FB7185", secondary: "#0B1220" } },
            }}
          />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/predict" element={<PredictionPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/model-info" element={<ModelInfoPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
