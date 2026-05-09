/**
 * RegisterForm.js
 * Registration page with real-time per-field validation.
 * Fields: name · email · password (strength meter) · confirm password
 */
import React, { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

// ─── Validation helpers ───────────────────────────────────────────────────────
const validators = {
  name: (v) => {
    if (!v.trim()) return "Full name is required.";
    if (v.trim().length < 2) return "Name must be at least 2 characters.";
    return "";
  },
  email: (v) => {
    if (!v.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address.";
    return "";
  },
  password: (v) => {
    if (!v) return "Password is required.";
    if (v.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(v)) return "Include at least one uppercase letter.";
    if (!/[0-9]/.test(v)) return "Include at least one number.";
    return "";
  },
  password_confirmation: (v, form) => {
    if (!v) return "Please confirm your password.";
    if (v !== form.password) return "Passwords do not match.";
    return "";
  },
};

// ─── Password strength ────────────────────────────────────────────────────────
const getStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score; // 0–4
};

const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
const strengthClass = ["", "strength-weak", "strength-fair", "strength-good", "strength-strong"];

// ─── Input field component ────────────────────────────────────────────────────
const Field = ({ id, label, error, touched, children }) => (
  <div className={`form-group ${touched && error ? "field-error" : touched ? "field-valid" : ""}`}>
    <label htmlFor={id}>{label}</label>
    {children}
    {touched && error && (
      <span className="field-hint field-hint--error" role="alert" id={`${id}-error`}>
        {error}
      </span>
    )}
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────
const RegisterForm = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  // Which fields have been interacted with
  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validate a single field and return error string
  const validate = useCallback(
    (name, value) => {
      const fn = validators[name];
      return fn ? fn(value, { ...form, [name]: value }) : "";
    },
    [form]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setApiError("");

    // Real-time validation only after field is touched
    if (touched[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
    }

    // Also live-check confirm password whenever password changes
    if (name === "password" && touched.password_confirmation) {
      setFieldErrors((prev) => ({
        ...prev,
        password_confirmation: validators.password_confirmation(
          form.password_confirmation,
          { ...form, password: value }
        ),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFieldErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    // Touch all fields to show all errors
    const allTouched = Object.keys(form).reduce((a, k) => ({ ...a, [k]: true }), {});
    const allErrors = Object.keys(form).reduce(
      (a, k) => ({ ...a, [k]: validate(k, form[k]) }),
      {}
    );
    setTouched(allTouched);
    setFieldErrors(allErrors);

    if (Object.values(allErrors).some(Boolean)) return;

    setLoading(true);
    setApiError("");
    setSuccess("");

    try {
      await register(form);
      setSuccess("Account created! Redirecting to login…");
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors ||
        "Registration failed. Please try again.";
      setApiError(typeof msg === "object" ? Object.values(msg).flat().join(" ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(form.password);
  const apiErrorId = apiError ? "register-error" : undefined;

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* ── Branding ── */}
        <div className="auth-brand">
          <div className="auth-logo">⚡</div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Start your journey today — it's free</p>
        </div>

        {/* ── Alerts ── */}
        {apiError && (
          <div className="alert alert--error" role="alert" id="register-error">
            <span className="alert-icon">⚠</span> {apiError}
          </div>
        )}
        {success && (
          <div className="alert alert--success" role="status">
            <span className="alert-icon">✓</span> {success}
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>

          {/* Name */}
          <Field
            id="reg-name"
            label="Full name"
            error={fieldErrors.name}
            touched={touched.name}
          >
            <input
              id="reg-name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="John Doe"
              autoComplete="name"
              disabled={loading}
              aria-invalid={!!(touched.name && fieldErrors.name)}
              aria-describedby={touched.name && fieldErrors.name ? "reg-name-error" : apiErrorId}
            />
          </Field>

          {/* Email */}
          <Field
            id="reg-email"
            label="Email address"
            error={fieldErrors.email}
            touched={touched.email}
          >
            <input
              id="reg-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={loading}
              aria-invalid={!!(touched.email && fieldErrors.email)}
              aria-describedby={touched.email && fieldErrors.email ? "reg-email-error" : apiErrorId}
            />
          </Field>

          {/* Password */}
          <Field
            id="reg-password"
            label="Password"
            error={fieldErrors.password}
            touched={touched.password}
          >
            <div className="input-wrapper">
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                disabled={loading}
                aria-invalid={!!(touched.password && fieldErrors.password)}
                aria-describedby={touched.password && fieldErrors.password ? "reg-password-error" : apiErrorId}
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
            {/* Strength meter */}
            {form.password && (
              <div className="strength-meter" aria-label={`Password strength: ${strengthLabel[strength]}`}>
                <div className="strength-bars">
                  {[1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className={`strength-bar ${i <= strength ? strengthClass[strength] : ""}`}
                    />
                  ))}
                </div>
                <span className={`strength-label ${strengthClass[strength]}`}>
                  {strengthLabel[strength]}
                </span>
              </div>
            )}
          </Field>

          {/* Confirm Password */}
          <Field
            id="reg-pwd-confirm"
            label="Confirm password"
            error={fieldErrors.password_confirmation}
            touched={touched.password_confirmation}
          >
            <input
              id="reg-pwd-confirm"
              type="password"
              name="password_confirmation"
              value={form.password_confirmation}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={loading}
              aria-invalid={!!(touched.password_confirmation && fieldErrors.password_confirmation)}
              aria-describedby={
                touched.password_confirmation && fieldErrors.password_confirmation
                  ? "reg-pwd-confirm-error"
                  : apiErrorId
              }
            />
          </Field>

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
            aria-busy={loading}
          >
            {loading && <span className="spinner" aria-hidden="true" />}
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
