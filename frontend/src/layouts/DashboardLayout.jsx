import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function DashboardLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-ink-950">
        <ScanLoader />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-ink-950">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function ScanLoader({ label = "Loading" }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border-2 border-ink-600" />
        <div className="absolute inset-0 rounded-full border-t-2 border-scan-500 animate-ring-spin" />
      </div>
      <p className="text-sm text-mist-500 font-mono">{label}…</p>
    </div>
  );
}
