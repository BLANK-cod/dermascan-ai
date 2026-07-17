import { LogOut, Menu, Moon, Sun } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const TITLES = {
  "/dashboard": "Dashboard",
  "/predict": "New Prediction",
  "/history": "Prediction History",
  "/analytics": "Analytics",
  "/model-info": "Model Information",
  "/profile": "Profile & Settings",
  "/admin": "Admin",
};

function initials(name = "") {
  return name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const title = TITLES[location.pathname] || "DermaScan AI";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 h-16 px-4 sm:px-6 border-b border-white/[0.06] bg-ink-900/60 backdrop-blur-xl">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden rounded-xl p-2 text-mist-300 hover:bg-white/[0.05] hover:text-scan-400 transition"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-widest text-mist-500 font-semibold">
            DermaScan AI
          </p>
          <p className="font-display font-semibold text-mist-100 truncate">{title}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="rounded-xl p-2.5 text-mist-300 hover:bg-white/[0.05] hover:text-scan-400 transition"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="hidden sm:flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] pl-2 pr-3 py-1.5">
          <div className="h-8 w-8 rounded-xl bg-grad-primary flex items-center justify-center text-ink-950 text-xs font-bold">
            {initials(user?.full_name || user?.username || "U")}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-mist-100 leading-tight truncate max-w-[140px]">
              {user?.full_name || user?.username}
            </p>
            <p className="text-[11px] text-mist-500 leading-tight truncate max-w-[140px]">
              {user?.email || `@${user?.username}`}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn-ghost hover:text-clinic-coral"
          aria-label="Sign out"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
