import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // hydrating from localStorage

  // Hydrate state from localStorage on first mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async ({ name, email, password, password_confirmation }) => {
    const response = await api.post("/register", {
      name,
      email,
      password,
      password_confirmation,
    });
    // Registration succeeds — return user data (no auto-login, let user log in)
    return response.data;
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async ({ email, password }) => {
    const response = await api.post("/login", { email, password });
    const { data: userData, token: accessToken } = response.data;

    // Persist in localStorage
    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));

    // Update global state
    setToken(accessToken);
    setUser(userData);

    return userData;
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      // Call backend to invalidate the token
      await api.post("/logout");
    } catch (err) {
      // Even if backend call fails, clear local session
      console.warn("Logout API call failed:", err.message);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
    }
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
