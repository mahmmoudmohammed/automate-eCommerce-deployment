/**
 * LoginForm.js
 * Login page with email + password, show/hide toggle, shake on error.
 */
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const errorId = apiError ? "login-error" : undefined;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setApiError("");
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    // Basic client‑side guard
    if (!form.email || !form.password) {
      setApiError("Please fill in all fields.");
      triggerShake();
      return;
    }

    setLoading(true);
    setApiError("");

    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors ||
        "Invalid email or password.";
      setApiError(typeof msg === "object" ? Object.values(msg).flat().join(" ") : msg);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* ── Branding ── */}
        <div className="auth-brand">
          <div className="auth-logo">⚡</div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to continue</p>
        </div>

        {/* ── Error alert ── */}
        {apiError && (
          <div className="alert alert--error" role="alert" id="login-error">
            <span className="alert-icon">⚠</span> {apiError}
          </div>
        )}

        {/* ── Form ── */}
        <form
          onSubmit={handleSubmit}
          className={`auth-form ${shake ? "form-shake" : ""}`}
          noValidate
        >
          {/* Email */}
          <div className="form-group">
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={loading}
              aria-invalid={!!apiError}
              aria-describedby={errorId}
              required
            />
          </div>

          {/* Password + toggle */}
          <div className="form-group">
            <div className="label-row">
              <label htmlFor="login-password">Password</label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>
            <div className="input-wrapper">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
                aria-invalid={!!apiError}
                aria-describedby={errorId}
                required
              />
              <button
                type="button"
                className="toggle-pw"
                onClick={() => setShowPassword((s) => !s)}
                disabled={loading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
            aria-busy={loading}
          >
            {loading && <span className="spinner" aria-hidden="true" />}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
