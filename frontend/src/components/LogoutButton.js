/**
 * LogoutButton.js
 * Reusable logout button — calls the /logout API, clears auth state,
 * and redirects to /login. Accepts optional className and label props.
 */
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const LogoutButton = ({
  label = "Sign Out",
  className = "",
  redirectTo = "/login",
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout(); // calls POST /logout, then clears localStorage + state
    } finally {
      setLoading(false);
      navigate(redirectTo, { replace: true });
    }
  };

  return (
    <button
      id="logout-btn"
      className={`logout-btn ${className}`}
      onClick={handleLogout}
      disabled={loading}
      aria-busy={loading}
      aria-label="Sign out of your account"
    >
      {loading ? (
        <>
          <span className="spinner spinner--sm" aria-hidden="true" />
          <span>Signing out…</span>
        </>
      ) : (
        <>
          <span className="logout-icon" aria-hidden="true">→</span>
          <span>{label}</span>
        </>
      )}
    </button>
  );
};

export default LogoutButton;
