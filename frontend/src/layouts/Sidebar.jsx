import {
  Activity,
  ChevronsLeft,
  ChevronsRight,
  Gauge,
  History,
  LayoutGrid,
  ScanFace,
  Shield,
  Sparkles,
  User,
  X,
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

function BrandMark({ small = false }) {
  return (
    <div className="relative shrink-0" style={{ width: small ? 32 : 36, height: small ? 32 : 36 }}>
      <div className="absolute inset-0 rounded-xl bg-grad-primary opacity-90 blur-[6px]" />
      <div className="relative h-full w-full rounded-xl bg-grad-primary flex items-center justify-center text-ink-950 shadow-glow">
        <Sparkles size={small ? 16 : 18} strokeWidth={2.5} />
      </div>
    </div>
  );
}

function NavItem({ to, label, icon: Icon, collapsed, danger, onNavigate }) {
  const activeCls = danger
    ? "bg-clinic-coral/10 text-clinic-coral border-clinic-coral/30 shadow-[0_0_20px_-6px_rgba(251,113,133,0.4)]"
    : "bg-scan-500/10 text-scan-400 border-scan-500/40 shadow-[0_0_20px_-6px_rgba(20,184,166,0.45)]";
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium border border-transparent transition-all ${
          isActive ? activeCls : "text-mist-300 hover:bg-white/[0.04] hover:text-mist-100 hover:border-white/10"
        }`
      }
      title={collapsed ? label : undefined}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  const inner = (onNavigate) => (
    <>
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/[0.06]">
        <BrandMark />
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-display font-bold tracking-tight text-mist-100 leading-none">
              DermaScan <span className="text-gradient">AI</span>
            </p>
            <p className="text-[10px] uppercase tracking-widest text-mist-500 mt-1">
              Clinical Console
            </p>
          </div>
        )}
        {onMobileClose && (
          <button
            className="ml-auto md:hidden rounded-lg p-2 text-mist-500 hover:bg-white/5"
            onClick={onMobileClose}
          >
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="px-3 pb-2 text-[10px] uppercase tracking-widest text-mist-500 font-semibold">
            Workspace
          </p>
        )}
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
        {user?.is_admin && (
          <>
            {!collapsed && (
              <p className="px-3 pt-4 pb-2 text-[10px] uppercase tracking-widest text-mist-500 font-semibold">
                Administration
              </p>
            )}
            <NavItem
              to="/admin"
              label="Admin"
              icon={Shield}
              collapsed={collapsed}
              danger
              onNavigate={onNavigate}
            />
          </>
        )}
      </nav>

      {!collapsed && (
        <div className="mx-3 mb-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-scan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-scan-500" />
            </span>
            <p className="text-xs font-medium text-mist-100">Model online</p>
          </div>
          <p className="mt-1 text-[11px] text-mist-500">DeiT + AG-GELU · 7-class</p>
        </div>
      )}

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="hidden md:flex items-center justify-center gap-2 mx-3 mb-4 rounded-xl py-2.5 text-mist-500 hover:text-scan-400 hover:bg-white/[0.04] transition"
      >
        {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
      </button>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className={`hidden md:flex flex-col shrink-0 border-r border-white/[0.06] bg-ink-900/70 backdrop-blur-xl transition-all duration-300 ${
          collapsed ? "w-[76px]" : "w-64"
        }`}
      >
        {inner()}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm animate-fade-in"
            onClick={onMobileClose}
          />
          <aside className="absolute left-0 top-0 h-full w-72 flex flex-col bg-ink-900/95 backdrop-blur-xl border-r border-white/10 shadow-2xl animate-fade-in">
            {inner(onMobileClose)}
          </aside>
        </div>
      )}
    </>
  );
}
