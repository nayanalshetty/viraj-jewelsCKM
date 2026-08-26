import { useEffect, useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

import "./AdminLogin.css";

export default function AdminLogin() {
  const {
    user,
    loading,
    login,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    setError("");
  }, [email, password]);

  if (loading) {
    return (
      <main className="admin-login-page">
        <div className="admin-login-loading">
          Loading...
        </div>
      </main>
    );
  }

  if (user) {
    const from =
      location.state?.from?.pathname ||
      "/admin";

    return (
      <Navigate
        to={from}
        replace
      />
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your admin email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoggingIn(true);

    try {
      await login(email, password);

      navigate("/admin", {
        replace: true,
      });
    } catch (loginError) {
      console.error(
        "Admin login error:",
        loginError
      );

      // Don't show Supabase's technical error.
      setError("Incorrect email or password.");
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <main className="admin-login-page">

      <section className="admin-login-card">

        <div className="admin-login-brand">

          <span>V</span>

          <div>
            <strong>
              VIRAJ JEWELLERY
            </strong>

            <small>
              ADMINISTRATION
            </small>
          </div>

        </div>

        <div className="admin-login-heading">

          <p>
            PRIVATE ACCESS
          </p>

          <h1>
            Admin Login
          </h1>

          <span>
            Sign in to manage Viraj Jewellery
            orders.
          </span>

        </div>

        <form
          onSubmit={handleSubmit}
          className="admin-login-form"
        >

          <div className="admin-login-field">

            <label htmlFor="admin-email">
              Admin Email
            </label>

            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="admin@example.com"
              autoComplete="email"
            />

          </div>

          <div className="admin-login-field">

            <label htmlFor="admin-password">
              Password
            </label>

            <div className="admin-password-wrapper">

              <input
                id="admin-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
              />

              <button
                type="button"
                className="admin-password-toggle"
                onClick={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>

          </div>

          {error && (
            <div className="admin-login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loggingIn}
            className="admin-login-button"
          >
            {loggingIn
              ? "SIGNING IN..."
              : "SIGN IN TO ADMIN"}
          </button>

        </form>

        <div className="admin-login-security">

          <span>✓</span>

          <p>
            Protected Admin Area

            <small>
              Authorized personnel only
            </small>
          </p>

        </div>

        <button
          type="button"
          className="admin-back-button"
          onClick={() =>
            navigate("/")
          }
        >
          ← Back to Website
        </button>

      </section>

    </main>
  );
}