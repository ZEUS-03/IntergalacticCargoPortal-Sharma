import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, signupUser } from "../api/api";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshAuth, setAuth } = useAuth();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const session = await loginUser({ email, password });
        setAuth(session);
        await refreshAuth();
        navigate("/dashboard", { replace: true });
      } else {
        const session = await signupUser({ email, password });
        setAuth(session);
        await refreshAuth();
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err.body?.message || err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="hero-copy">
          <p className="eyebrow">Intergalactic Cargo Portal</p>
          <h1>Mission control for manifest operations.</h1>
          <p>
            Access the cargo dashboard, upload manifests, and track payloads
            across the fleet.
          </p>
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="toggle-row">
            <button
              type="button"
              className={isLogin ? "tab active" : "tab"}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              type="button"
              className={!isLogin ? "tab active" : "tab"}
              onClick={() => setIsLogin(false)}
            >
              Signup
            </button>
          </div>

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />
          </label>

          {error ? <div className="error-banner">{error}</div> : null}

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Processing…" : isLogin ? "Login" : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}
