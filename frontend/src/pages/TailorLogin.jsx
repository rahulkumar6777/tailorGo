import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import tailorVideo from "../assets/tailorVideo.mp4";
import { useAuth } from "../context/useAuth";

function TailorLogin() {
  const navigate = useNavigate();
  const { loginTailor } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      await loginTailor(form);
      navigate("/", { replace: true });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-pro">
      <div className="auth-header font1">
        <div className="auth-eyebrow font1">Tailor login</div>
        <h2 className="text1 f-28">
          Access Your <span className="text-capsule-blue">Dashboard</span>
        </h2>
        <p>Sign in after your TailorGo verification is approved.</p>
      </div>

      <div className="auth-layout">
        <div className="auth-customer">
          <div className="auth-form-header">
            <h2>Tailor Login</h2>
            <p>Continue managing your work.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="you@email.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {status.message && <div className={`auth-message ${status.type}`}>{status.message}</div>}

            <button className="auth-btn" type="submit" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign In ->"}
            </button>
          </form>

          <p className="auth-switch">
            New here? <Link to="/tailor-signup">Create account</Link>
          </p>
        </div>

        <div className="auth-tailor">
          <video autoPlay loop muted playsInline className="video-source">
            <source src={tailorVideo} type="video/mp4" />
          </video>
          <div className="video-overlay" />

          <div className="tailor-content">
            <h2>Keep Your Business Running</h2>
            <p>Track customers, orders, and your TailorGo profile from one place.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TailorLogin;
