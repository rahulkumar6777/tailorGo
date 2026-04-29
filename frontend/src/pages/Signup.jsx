import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import tailorVideo from "../assets/tailorVideo.mp4";
import { authApi } from "../lib/api";

const initialForm = {
  name: "",
  email: "",
  phoneNo: "",
  password: "",
  code: "",
};

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [otpSent, setOtpSent] = useState(false);
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
      if (!otpSent) {
        await authApi.userRegisterInit({
          name: form.name,
          email: form.email,
          phoneNo: form.phoneNo,
          password: form.password,
        });
        setOtpSent(true);
        setStatus({ type: "success", message: "OTP sent to your email." });
        return;
      }

      await authApi.userRegisterVerify({
        email: form.email,
        code: form.code,
      });
      setStatus({ type: "success", message: "Account verified. Redirecting to login..." });
      setTimeout(() => navigate("/login", { replace: true }), 700);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-pro">
      <div className="auth-header font1">
        <div className="auth-eyebrow font1">Customer signup</div>
        <h2 className="text1 f-28">
          Your Perfect Fit <span className="text-capsule-blue">Starts Here</span>
        </h2>
        <p>Create an account, verify your email, and book your first appointment.</p>
      </div>

      <div className="auth-layout">
        <div className="auth-customer">
          <div className="auth-form-header">
            <h2>{otpSent ? "Verify Your Email" : "Create Your Account"}</h2>
            <p>{otpSent ? `Enter the OTP sent to ${form.email}` : "Join free with your basic details."}</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {!otpSent && (
              <>
                <div className="input-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Arjun Sharma"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

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
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNo"
                    placeholder="10 digit mobile number"
                    value={form.phoneNo}
                    onChange={handleChange}
                    pattern="[0-9]{10}"
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    minLength={6}
                    required
                  />
                </div>
              </>
            )}

            {otpSent && (
              <div className="input-group">
                <label>Email OTP</label>
                <input
                  type="text"
                  name="code"
                  placeholder="Enter 6 digit OTP"
                  value={form.code}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {status.message && <div className={`auth-message ${status.type}`}>{status.message}</div>}

            <button className="auth-btn" type="submit" disabled={submitting}>
              {submitting ? "Please wait..." : otpSent ? "Verify Account ->" : "Send OTP ->"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
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
            <p>Build your TailorGo profile and get discovered by customers near you.</p>

            <Link to="/tailor-signup" className="tailor-btn">
              Join as a Tailor
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Signup;
