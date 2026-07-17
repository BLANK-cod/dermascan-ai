import {
  Activity,
  ChevronsLeft,
  ChevronsRight,
  Gauge,
  History,
  LayoutGrid,
  ScanFace,
  Shield,
  User,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: Gauge },
  { to: "/predict", label: "Prediction", icon: ScanFace },
  { to: "/history", label: "History", icon: History },
  { to: "/analytics", label: "Analytics", icon: Activity },
  { to: "/model-info", label: "Model Info", icon: LayoutGrid },
  { to: "/profile", label: "Profile", icon: User },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  return (
    <aside
      className={`hidden md:flex flex-col shrink-0 border-r border-ink-600/60 bg-ink-900 transition-all duration-300 ${
        collapsed ? "w-[76px]" : "w-64"
      }`}
    >
      <div className="flex items-center gap-3 px-5 h-16 border-b border-ink-600/60">
        <div className="relative h-8 w-8 shrink-0 rounded-full border-2 border-scan-500">
          <span className="absolute inset-1 rounded-full bg-scan-500/20 animate-pulse" />
        </div>
        {!collapsed && (
          <span className="font-display font-semibold tracking-tight text-mist-100">
            DermaScan <span className="text-scan-400">AI</span>
          </span>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-scan-500/10 text-scan-400 border border-scan-500/30"
                  : "text-mist-300 hover:bg-ink-800 hover:text-mist-100"
              }`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}

        {user?.is_admin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-clinic-coral/10 text-clinic-coral border border-clinic-coral/30"
                  : "text-mist-300 hover:bg-ink-800 hover:text-mist-100"
              }`
            }
            title={collapsed ? "Admin" : undefined}
          >
            <Shield size={18} className="shrink-0" />
            {!collapsed && <span>Admin</span>}
          </NavLink>
        )}
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center justify-center gap-2 mx-3 mb-4 rounded-xl py-2.5 text-mist-500 hover:text-scan-400 hover:bg-ink-800 transition"
      >
        {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
      </button>
    </aside>
  );
}
