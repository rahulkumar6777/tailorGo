import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import tailorVideo from "../assets/tailorVideo.mp4";
import { useAuth } from "../context/useAuth";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginCustomer } = useAuth();
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
      await loginCustomer(form);
      navigate(location.state?.from?.pathname || "/booking", { replace: true });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-pro">
      <div className="auth-header font1">
        <div className="auth-eyebrow font1">Customer login</div>
        <h2 className="text1 f-28">
          Tailoring, <span className="text-capsule-blue">Reimagined</span>
        </h2>
        <p>Sign in to book a tailor and manage your appointments.</p>
      </div>

      <div className="auth-layout">
        <div className="auth-customer">
          <div className="auth-form-header">
            <h2>Welcome Back</h2>
            <p>Use the email and password you registered with.</p>
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
            Don't have an account? <Link to="/signup">Create one free</Link>
          </p>
        </div>

        <div className="auth-tailor">
          <video autoPlay loop muted playsInline className="video-source">
            <source src={tailorVideo} type="video/mp4" />
          </video>
          <div className="video-overlay" />

          <div className="tailor-content">
            <div className="tailor-eyebrow">For Professionals</div>
            <h2>Are You a Master Tailor?</h2>
            <p>Join verified tailors on TailorGo and get discovered by customers near you.</p>

            <Link to="/tailor-signup" className="tailor-btn">
              Join as a Tailor
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;
