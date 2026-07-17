import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function DashboardLayout() {
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-ink-900">
        <ScanLoader />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-transparent">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex flex-1 flex-col min-w-0">
        <Navbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export function ScanLoader({ label = "Loading" }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
        <div className="absolute inset-0 rounded-full border-t-2 border-scan-500 animate-ring-spin" />
        <div className="absolute inset-2 rounded-full border-b-2 border-cyan-500 animate-ring-spin [animation-duration:2s] [animation-direction:reverse]" />
        <div className="absolute inset-5 rounded-full bg-grad-primary opacity-70 blur-md" />
      </div>
      <p className="text-xs uppercase tracking-widest text-mist-500 font-semibold">{label}…</p>
    </div>
  );
}
