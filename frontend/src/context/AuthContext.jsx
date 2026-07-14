import { createContext, useContext, useEffect, useState } from "react";
import { getProfile, loginUser, registerUser } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("dermascan_token");
    if (!token) {
      setLoading(false);
      return;
    }
    getProfile()
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem("dermascan_token"))
      .finally(() => setLoading(false));
  }, []);

  async function login(username, password) {
    const res = await loginUser({ username, password });
    localStorage.setItem("dermascan_token", res.data.access_token);
    const profile = await getProfile();
    setUser(profile.data);
    return profile.data;
  }

  async function register(payload) {
    await registerUser(payload);
    return login(payload.username, payload.password);
  }

  function logout() {
    localStorage.removeItem("dermascan_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
