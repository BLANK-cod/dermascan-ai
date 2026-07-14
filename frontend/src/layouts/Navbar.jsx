import { LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-ink-600/60 bg-ink-900/80 backdrop-blur">
      <div>
        <p className="text-sm text-mist-500">Welcome back</p>
        <p className="font-display font-medium text-mist-100">
          {user?.full_name || user?.username}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="rounded-xl p-2.5 text-mist-300 hover:bg-ink-800 hover:text-scan-400 transition"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-mist-300 hover:bg-ink-800 hover:text-clinic-coral transition"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </header>
  );
}
