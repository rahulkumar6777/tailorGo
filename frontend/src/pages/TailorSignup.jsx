import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import tailorVideo from "../assets/tailorVideo.mp4";
import { authApi } from "../lib/api";

const initialForm = {
  name: "",
  shopName: "",
  email: "",
  phoneNo: "",
  password: "",
  age: "",
  gender: "male",
  experience: "",
  shopAddress: "",
  verificationType: "aadharCard",
  lat: "",
  lng: "",
  code: "",
};

const SERVICE_OPTIONS = [
  "Alteration",
  "Blouse Stitching",
  "Kurta Stitching",
  "Pajama Stitching",
  "Salwar Suit",
  "Anarkali Suit",
  "Punjabi Suit",
  "Patiala Suit",
  "Lehenga Stitching",
  "Saree Fall Pico",
  "Saree Blouse",
  "Petticoat",
  "Custom Shirt",
  "Formal Shirt",
  "T-Shirt Alteration",
  "Trouser Stitching",
  "Pant Alteration",
  "Jeans Alteration",
  "Suit Stitching",
  "Blazer Stitching",
  "Waistcoat",
  "Sherwani",
  "Indo Western",
  "Nehru Jacket",
  "Bandhgala",
  "Jodhpuri Suit",
  "Wedding Outfit",
  "Gown Stitching",
  "Evening Dress",
  "Skirt Stitching",
  "Kids Wear",
  "School Uniform",
  "Corporate Uniform",
  "Apron Stitching",
  "Jacket Alteration",
  "Coat Alteration",
  "Zip Replacement",
  "Button Fixing",
  "Embroidery Work",
  "Hand Work",
  "Lining Work",
  "Measurement Visit",
  "Custom Service",
];

const createEmptyService = () => ({
  serviceType: "",
  customServiceType: "",
  price: "",
});

function TailorSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [services, setServices] = useState([{ serviceType: "Alteration", price: "" }]);
  const [otpSent, setOtpSent] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleServiceChange = (index, field, value) => {
    setServices((current) =>
      current.map((service, serviceIndex) =>
        serviceIndex === index
          ? {
              ...service,
              [field]: value,
              ...(field === "serviceType" && value !== "Custom Service" ? { customServiceType: "" } : {}),
            }
          : service,
      ),
    );
  };

  const addService = () => {
    setServices((current) => [...current, createEmptyService()]);
  };

  const removeService = (index) => {
    setServices((current) => current.filter((_, serviceIndex) => serviceIndex !== index));
  };

  const fillCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatus({ type: "error", message: "Location is not supported in this browser." });
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((current) => ({
          ...current,
          lat: String(position.coords.latitude),
          lng: String(position.coords.longitude),
        }));
        setLocating(false);
      },
      () => {
        setStatus({ type: "error", message: "Could not read location. You can enter latitude and longitude manually." });
        setLocating(false);
      },
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      if (!otpSent) {
        const servicesOffered = services
          .map((service) => ({
            serviceType:
              service.serviceType === "Custom Service"
                ? service.customServiceType.trim()
                : service.serviceType,
            price: Number(service.price),
          }))
          .filter((service) => service.serviceType && service.price > 0);

        if (!servicesOffered.length) {
          setStatus({ type: "error", message: "Please add at least one service and price." });
          return;
        }

        await authApi.tailorRegisterInit({
          name: form.name,
          shopName: form.shopName,
          email: form.email,
          phoneNo: form.phoneNo,
          password: form.password,
          age: Number(form.age),
          gender: form.gender,
          experience: Number(form.experience),
          shopAddress: form.shopAddress,
          servicesOffered,
          verificationType: form.verificationType,
          coordinates: {
            lat: Number(form.lat),
            lng: Number(form.lng),
          },
        });
        setOtpSent(true);
        setStatus({ type: "success", message: "OTP sent to your email." });
        return;
      }

      await authApi.tailorRegisterVerify({
        email: form.email,
        code: form.code,
      });
      setStatus({
        type: "success",
        message: "Account submitted. You can log in after admin verification is approved.",
      });
      setTimeout(() => navigate("/tailor-login", { replace: true }), 1200);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-pro">
      <div className="auth-header font1">
        <div className="auth-eyebrow font1">Tailor signup</div>
        <h2 className="text1 f-28">
          Grow Your <span className="text-capsule-blue">Tailoring Business</span>
        </h2>
        <p>Send your profile details, verify your email, then wait for admin approval.</p>
      </div>

      <div className="auth-layout">
        <div className="auth-customer">
          <div className="auth-form-header">
            <h2>{otpSent ? "Verify Tailor Email" : "Create Tailor Account"}</h2>
            <p>{otpSent ? `Enter the OTP sent to ${form.email}` : "These fields match your backend tailor API."}</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {!otpSent && (
              <>
                <div className="auth-grid">
                  <div className="input-group">
                    <label>Full Name</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Ramesh Kumar" required />
                  </div>

                  <div className="input-group">
                    <label>Shop Name</label>
                    <input name="shopName" value={form.shopName} onChange={handleChange} placeholder="Ramesh Tailors" required />
                  </div>
                </div>

                <div className="auth-grid">
                  <div className="input-group">
                    <label>Email Address</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@email.com" required />
                  </div>

                  <div className="input-group">
                    <label>Phone Number</label>
                    <input type="tel" name="phoneNo" value={form.phoneNo} onChange={handleChange} pattern="[0-9]{10}" placeholder="10 digit mobile number" required />
                  </div>
                </div>

                <div className="auth-grid">
                  <div className="input-group">
                    <label>Password</label>
                    <input type="password" name="password" value={form.password} onChange={handleChange} minLength={6} placeholder="Min. 6 characters" required />
                  </div>

                  <div className="input-group">
                    <label>Gender</label>
                    <select name="gender" value={form.gender} onChange={handleChange} required>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="auth-grid">
                  <div className="input-group">
                    <label>Age</label>
                    <input type="number" name="age" value={form.age} onChange={handleChange} min="18" max="70" required />
                  </div>

                  <div className="input-group">
                    <label>Experience</label>
                    <input type="number" name="experience" value={form.experience} onChange={handleChange} min="0" placeholder="Years" required />
                  </div>
                </div>

                <div className="input-group">
                  <label>Shop Address</label>
                  <input name="shopAddress" value={form.shopAddress} onChange={handleChange} placeholder="Street, area, city" />
                </div>

                <div className="services-panel">
                  <div className="services-panel-header">
                    <div>
                      <label>Services Offered</label>
                      <p>Select tailoring services and enter starting price for each.</p>
                    </div>
                    <button className="service-add-btn" type="button" onClick={addService}>
                      Add Service
                    </button>
                  </div>

                  <div className="service-list">
                    {services.map((service, index) => (
                      <div className="service-row" key={`${service.serviceType}-${index}`}>
                        <div className="input-group">
                          <label>Service</label>
                          <select
                            value={service.serviceType}
                            onChange={(event) => handleServiceChange(index, "serviceType", event.target.value)}
                            required
                          >
                            <option value="">Select service</option>
                            {SERVICE_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>

                        {service.serviceType === "Custom Service" && (
                          <div className="input-group">
                            <label>Custom Service</label>
                            <input
                              value={service.customServiceType}
                              onChange={(event) => handleServiceChange(index, "customServiceType", event.target.value)}
                              placeholder="e.g. Designer bridal blouse"
                              required
                            />
                          </div>
                        )}

                        <div className="input-group">
                          <label>Starting Price</label>
                          <input
                            type="number"
                            value={service.price}
                            onChange={(event) => handleServiceChange(index, "price", event.target.value)}
                            min="1"
                            placeholder="499"
                            required
                          />
                        </div>

                        {services.length > 1 && (
                          <button
                            className="service-remove-btn"
                            type="button"
                            onClick={() => removeService(index)}
                            aria-label="Remove service"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="input-group">
                  <label>Verification Type</label>
                  <select name="verificationType" value={form.verificationType} onChange={handleChange} required>
                    <option value="aadharCard">Aadhar Card</option>
                    <option value="voterId">Voter ID</option>
                  </select>
                </div>

                <div className="auth-grid">
                  <div className="input-group">
                    <label>Latitude</label>
                    <input type="number" name="lat" value={form.lat} onChange={handleChange} step="any" required />
                  </div>

                  <div className="input-group">
                    <label>Longitude</label>
                    <input type="number" name="lng" value={form.lng} onChange={handleChange} step="any" required />
                  </div>
                </div>

                <button className="auth-btn auth-btn-secondary" type="button" onClick={fillCurrentLocation} disabled={locating}>
                  {locating ? "Reading location..." : "Use Current Location"}
                </button>
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
                  minLength={6}
                  maxLength={6}
                  required
                />
              </div>
            )}

            {status.message && <div className={`auth-message ${status.type}`}>{status.message}</div>}

            <button className="auth-btn" type="submit" disabled={submitting}>
              {submitting ? "Please wait..." : otpSent ? "Verify Tailor Account ->" : "Send OTP ->"}
            </button>
          </form>

          <p className="auth-switch">
            Already a tailor? <Link to="/tailor-login">Sign in</Link>
          </p>
        </div>

        <div className="auth-tailor">
          <video autoPlay loop muted playsInline className="video-source">
            <source src={tailorVideo} type="video/mp4" />
          </video>
          <div className="video-overlay" />

          <div className="tailor-content">
            <div className="tailor-eyebrow">Why Join?</div>
            <h2>Get More Customers</h2>

            <div className="tailor-perks">
              <div className="tailor-perk">Receive orders from nearby customers</div>
              <div className="tailor-perk">Build trust with a verified profile</div>
              <div className="tailor-perk">Manage work from your phone</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TailorSignup;
