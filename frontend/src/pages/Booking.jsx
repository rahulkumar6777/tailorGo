import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/booking.css";
// import { Link } from 'react-router-dom'

const OUTFITS = [
  { id: "sherwani",   icon: "🥻", name: "Sherwani",      desc: "Wedding & ceremonial" },
  { id: "suit",       icon: "🤵", name: "Custom Suit",    desc: "Formal & office wear" },
  { id: "kurta",      icon: "👕", name: "Kurta Set",      desc: "Casual & festive"     },
  { id: "bandhgala",  icon: "👔", name: "Bandhgala",      desc: "Indo-formal"          },
  { id: "nehru",      icon: "🧥", name: "Nehru Jacket",   desc: "Layering piece"       },
  { id: "alteration", icon: "✂️", name: "Alteration",     desc: "Repair & resize"      },
];

const SLOTS = [
  "10:00 AM – 12:00 PM",
  "12:00 PM – 2:00 PM",
  "2:00 PM – 4:00 PM",
  "4:00 PM – 6:00 PM",
  "6:00 PM – 8:00 PM",
];

const STEPS = [
  { num: 1, label: "What to stitch",  icon: "✂️" },
  { num: 2, label: "Schedule visit",  icon: "📅" },
  { num: 3, label: "Confirm",         icon: "✓"  },
];

// Dummy tailor — in real app pass via router state / context
const TAILOR = {
  name: "Master Ibrahim",
  rating: 4.9,
  reviews: 248,
  exp: "22 yrs",
  location: "Bandra West, Mumbai",
  initials: "MI",
  specialties: ["Sherwani", "Suits", "Bandhgala"],
};

export default function Booking() {
  const navigate = useNavigate();
  const [step, setStep]     = useState(1);
  const [done, setDone]     = useState(false);
  const [outfit, setOutfit] = useState(null);
  const [notes, setNotes]   = useState("");
  const [date, setDate]     = useState("");
  const [slot, setSlot]     = useState("");
  const [address, setAddress] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const canNext1 = !!outfit;
  const canNext2 = !!date && !!slot && address.trim().length > 5;
  const selectedOutfit = OUTFITS.find(o => o.id === outfit);

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "";

  if (done) return (
    <div className="bp-page">
      <div className="bp-success-wrap">
        <div className="bp-success-card">
          <div className="bp-success-icon">✓</div>
          <h2 className="bp-success-title">Booking Confirmed!</h2>
          <p className="bp-success-sub">
            <strong>{TAILOR.name}</strong> will visit you on <strong>{formattedDate}</strong> between <strong>{slot}</strong>.
          </p>

          <div className="bp-success-details">
            <div className="bp-sd-row"><span>Outfit</span><strong>{selectedOutfit?.icon} {selectedOutfit?.name}</strong></div>
            <div className="bp-sd-row"><span>Date</span><strong>{formattedDate}</strong></div>
            <div className="bp-sd-row"><span>Time</span><strong>{slot}</strong></div>
            <div className="bp-sd-row"><span>Address</span><strong>{address}</strong></div>
            <div className="bp-sd-row"><span>Visit Fee</span><strong>₹299 (pay on arrival)</strong></div>
          </div>

          <div className="bp-whatsapp-note">
            📱 A confirmation has been sent to your WhatsApp
          </div>

          <div className="bp-success-actions">
            <button className="bp-btn-primary" onClick={() => navigate("/")}>Back to Home</button>
            <button className="bp-btn-outline" onClick={() => navigate("/dashboard")}>View My Orders</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bp-page">

      {/* TOP BAR */}
      <div className="bp-topbar">
        <button className="bp-back-link" onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)}>
          ← {step > 1 ? "Back" : "Back to Profile"}
        </button>
        <div className="bp-topbar-title">Book Appointment</div>
        <div className="bp-topbar-step">Step {step} of 3</div>
      </div>

      <div className="bp-layout">

        {/* LEFT — STEP CONTENT */}
        <div className="bp-main">

          {/* STEP PROGRESS */}
          <div className="bp-progress">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.num}>
                <div className={`bp-step ${step === s.num ? "active" : ""} ${step > s.num ? "done" : ""}`}>
                  <div className="bp-step-circle">
                    {step > s.num ? "✓" : s.num}
                  </div>
                  <span className="bp-step-label">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`bp-step-connector ${step > s.num ? "done" : ""}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* ── STEP 1 — OUTFIT ── */}
          {step === 1 && (
            <div className="bp-card">
              <div className="bp-card-header">
                <h2>What would you like stitched?</h2>
                <p>Select the outfit type for this home visit</p>
              </div>

              <div className="bp-outfit-grid">
                {OUTFITS.map(o => (
                  <div
                    key={o.id}
                    className={`bp-outfit-item ${outfit === o.id ? "selected" : ""}`}
                    onClick={() => setOutfit(o.id)}
                  >
                    {outfit === o.id && <div className="bp-outfit-check">✓</div>}
                    <div className="bp-outfit-icon">{o.icon}</div>
                    <div className="bp-outfit-name">{o.name}</div>
                    <div className="bp-outfit-desc">{o.desc}</div>
                  </div>
                ))}
              </div>

              <div className="bp-field">
                <label>
                  Special notes
                  <span className="bp-optional">optional</span>
                </label>
                <textarea
                  className="bp-textarea"
                  rows={3}
                  placeholder="e.g. Wedding on Dec 15, want dark maroon fabric, open to suggestions on embroidery…"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <div className="bp-step-footer">
                <button
                  className="bp-btn-primary"
                  disabled={!canNext1}
                  onClick={() => setStep(2)}
                >
                  Continue → Schedule Visit
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2 — SCHEDULE ── */}
          {step === 2 && (
            <div className="bp-card">
              <div className="bp-card-header">
                <h2>Schedule your home visit</h2>
                <p>{TAILOR.name} will come to your door for measurements</p>
              </div>

              <div className="bp-field">
                <label>Preferred Date</label>
                <input
                  type="date"
                  className="bp-input"
                  value={date}
                  min={today}
                  onChange={e => setDate(e.target.value)}
                />
              </div>

              <div className="bp-field">
                <label>Pick a Time Slot</label>
                <div className="bp-slots">
                  {SLOTS.map(t => (
                    <div
                      key={t}
                      className={`bp-slot ${slot === t ? "selected" : ""}`}
                      onClick={() => setSlot(t)}
                    >
                      {slot === t && <span className="bp-slot-check">✓</span>}
                      {t}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bp-field">
                <label>Your Address</label>
                <textarea
                  className="bp-textarea"
                  rows={3}
                  placeholder="Flat no., Building name, Street, Area, City, Pincode…"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                />
                <div className="bp-field-note">📍 The tailor will visit this address</div>
              </div>

              <div className="bp-step-footer">
                <button className="bp-btn-outline" onClick={() => setStep(1)}>← Back</button>
                <button
                  className="bp-btn-primary"
                  disabled={!canNext2}
                  onClick={() => setStep(3)}
                >
                  Continue → Review
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3 — CONFIRM ── */}
          {step === 3 && (
            <div className="bp-card">
              <div className="bp-card-header">
                <h2>Review & Confirm</h2>
                <p>Check your details before confirming the booking</p>
              </div>

              <div className="bp-review-block">
                <div className="bp-review-label">Outfit</div>
                <div className="bp-review-val bp-review-outfit">
                  <span>{selectedOutfit?.icon}</span>
                  <div>
                    <strong>{selectedOutfit?.name}</strong>
                    <span>{selectedOutfit?.desc}</span>
                  </div>
                </div>
              </div>

              <div className="bp-review-grid">
                <div className="bp-review-block">
                  <div className="bp-review-label">Date</div>
                  <div className="bp-review-val">{formattedDate}</div>
                </div>
                <div className="bp-review-block">
                  <div className="bp-review-label">Time Slot</div>
                  <div className="bp-review-val">{slot}</div>
                </div>
              </div>

              <div className="bp-review-block">
                <div className="bp-review-label">Address</div>
                <div className="bp-review-val">{address}</div>
              </div>

              {notes && (
                <div className="bp-review-block">
                  <div className="bp-review-label">Your Notes</div>
                  <div className="bp-review-val">{notes}</div>
                </div>
              )}

              <div className="bp-fee-row">
                <div>
                  <div className="bp-fee-title">Visit Fee</div>
                  <div className="bp-fee-note">Stitching cost discussed after measurements</div>
                </div>
                <div className="bp-fee-amount">₹299</div>
              </div>

              <div className="bp-pay-badge">
                💳 Pay ₹299 in cash on arrival — no online payment needed now
              </div>

              <div className="bp-step-footer">
                <button className="bp-btn-outline" onClick={() => setStep(2)}>← Back</button>
                <button className="bp-btn-primary bp-btn-confirm" onClick={() => setDone(true)}>
                  Confirm Booking →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — TAILOR STICKY CARD */}
        <div className="bp-sidebar">
          <div className="bp-tailor-card">
            <div className="bp-tc-header">Booking with</div>
            <div className="bp-tc-tailor">
              <div className="bp-tc-av">{TAILOR.initials}</div>
              <div>
                <div className="bp-tc-name">{TAILOR.name}</div>
                <div className="bp-tc-meta">⭐ {TAILOR.rating} · {TAILOR.reviews} reviews</div>
                <div className="bp-tc-meta">📍 {TAILOR.location}</div>
              </div>
            </div>
            <div className="bp-tc-tags">
              {TAILOR.specialties.map(s => (
                <span key={s} className="bp-tc-tag">{s}</span>
              ))}
            </div>
            <div className="bp-tc-divider" />
            <div className="bp-tc-price-row">
              <span>Visit fee</span>
              <strong>₹299</strong>
            </div>
            <div className="bp-tc-price-row">
              <span>Stitching from</span>
              <strong>₹1,200+</strong>
            </div>
            <div className="bp-tc-note">
              Final stitching price quoted after the tailor takes measurements
            </div>
          </div>

          <div className="bp-trust-card">
            <div className="bp-trust-item">🔒 Secure & verified tailor</div>
            <div className="bp-trust-item">📐 Precise home measurements</div>
            <div className="bp-trust-item">🚚 Outfit delivered in 48–72 hrs</div>
            <div className="bp-trust-item">↩️ Free alterations if needed</div>
          </div>
        </div>

      </div>
    </div>
  );
}