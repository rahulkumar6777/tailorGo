import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/TailorProfile.css';

const TAILOR = {
  name: 'Ibrahim Khalil',
  title: 'Master Tailor · Bespoke Specialist',
  quote: '"Crafting perfection, one stitch at a time."',
  location: 'Bandra West, Mumbai',
  exp: '22',
  orders: '1.2k+',
  rating: '4.9',
  reviews: 248,
  responseTime: '< 2 hrs',
  specialties: ['Sherwani', 'Bespoke Suit', 'Bandhgala', 'Kurta', 'Indo-Western'],
  languages: ['Hindi', 'Urdu', 'English', 'Marathi'],
  coverage: 'Bandra · Andheri · Juhu · Versova',
  about: `Ibrahim Khalil is one of Mumbai's most celebrated bespoke tailors, trained under the legendary Ustad Karimuddin Khan in Lucknow. Over 22 years, he has mastered the art of hand-cut garments — from regal sherwanis to precision-fit suits — blending traditional craftsmanship with contemporary silhouettes.

He has dressed grooms, celebrities, and corporate leaders across Maharashtra. Every stitch is done by hand; no structural seam is ever machine-finished. Ibrahim offers exclusive home visits so the entire experience — from measurement to delivery — happens at your door.`,
};

const SERVICES = [
  { icon: '🥻', name: 'Bespoke Sherwani', price: '₹4,500+', time: '7–10 days', tag: 'Most Booked' },
  { icon: '🤵', name: 'Custom Suit',       price: '₹3,200+', time: '5–7 days',  tag: null },
  { icon: '👔', name: 'Bandhgala',         price: '₹2,800+', time: '5–8 days',  tag: null },
  { icon: '👕', name: 'Kurta Set',         price: '₹1,200+', time: '3–5 days',  tag: 'Quick' },
  { icon: '🧥', name: 'Nehru Jacket',      price: '₹1,800+', time: '4–6 days',  tag: null },
  { icon: '✂️', name: 'Alteration',        price: '₹299+',   time: '1–2 days',  tag: 'Quick' },
];

const REVIEWS = [
  { name: 'Rahul K.',    init: 'RK', bg: '#dce8f5', stars: 5, time: '2 weeks ago',  outfit: 'Wedding Sherwani', text: 'Absolutely stunning work. The embroidery on my sherwani was flawless and the fit was better than anything I\'ve tried from a boutique. Ibrahim came for all three home fittings with no extra charge.' },
  { name: 'Arjun M.',   init: 'AM', bg: '#d4ead8', stars: 5, time: '1 month ago',   outfit: 'Bandhgala Suit',   text: 'Bought a bandhgala for my brother\'s reception. The drape and finishing were impeccable. Honestly felt like wearing a designer piece at half the price.' },
  { name: 'Siddharth D.', init: 'SD', bg: '#ecdcd0', stars: 4, time: '6 weeks ago', outfit: 'Custom Kurta',     text: 'Very professional with measurements and fabric selection. Slight delay but quality made up for it. Highly recommended for anyone looking for premium work.' },
];

const PORTFOLIO = [
  { icon: '🥻', label: 'Sherwani',     bg: 'linear-gradient(135deg, #c8d8ec, #a8c0d8)' },
  { icon: '🤵', label: 'Bandhgala',    bg: 'linear-gradient(135deg, #d4c8b8, #c0b0a0)' },
  { icon: '👕', label: 'Kurta Set',    bg: 'linear-gradient(135deg, #c8d8c8, #a8c0a8)' },
  { icon: '🧥', label: 'Nehru Jacket', bg: 'linear-gradient(135deg, #d8c8d8, #c0a8c0)' },
  { icon: '🤵', label: 'Suit',         bg: 'linear-gradient(135deg, #c8c8d8, #a8a8c0)' },
  { icon: '✂️', label: 'Alteration',   bg: 'linear-gradient(135deg, #d8d4c8, #c0bcb0)' },
];

export default function TailorProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('about');
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="tp-root">

      {/* ── HERO BANNER ── */}
      <div className="tp-hero">
        <div className="tp-hero-noise" />
        <div className="tp-hero-glow" />
        <div className="tp-breadcrumb">
          <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Home</span>
          <span className="tp-bc-sep">›</span>
          <span onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>Find Tailors</span>
          <span className="tp-bc-sep">›</span>
          <span className="tp-bc-active">Ibrahim Khalil</span>
        </div>
      </div>

      {/* ── PAGE WRAPPER ── */}
      <div className="tp-wrapper">

        {/* ══ LEFT COLUMN ══ */}
        <div className="tp-left">

          {/* IDENTITY CARD */}
          <div className="tp-identity">
            <div className="tp-identity-top">
              <div className="tp-avatar-wrap">
                <div className="tp-avatar">IK</div>
                <div className="tp-avatar-badge">✓</div>
              </div>
              <div className="tp-identity-info">
                <div className="tp-chips">
                  <span className="tp-chip tp-chip-blue">Verified Master</span>
                  <span className="tp-chip tp-chip-muted">📍 {TAILOR.location}</span>
                  <span className="tp-chip tp-chip-green">● Available</span>
                </div>
                <h1 className="tp-name text1">{TAILOR.name}</h1>
                <p className="tp-title">{TAILOR.title}</p>
                <p className="tp-quote">{TAILOR.quote}</p>
                <div className="tp-specialties">
                  {TAILOR.specialties.map(s => (
                    <span key={s} className="tp-spec-tag">{s}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="tp-stats-row">
              <div className="tp-stat">
                <div className="tp-stat-val">{TAILOR.exp}<span>yrs</span></div>
                <div className="tp-stat-lbl">Experience</div>
              </div>
              <div className="tp-stat-divider" />
              <div className="tp-stat">
                <div className="tp-stat-val">{TAILOR.orders}</div>
                <div className="tp-stat-lbl">Outfits Made</div>
              </div>
              <div className="tp-stat-divider" />
              <div className="tp-stat">
                <div className="tp-stat-val">{TAILOR.rating}<span>★</span></div>
                <div className="tp-stat-lbl">{TAILOR.reviews} Reviews</div>
              </div>
              <div className="tp-stat-divider" />
              <div className="tp-stat">
                <div className="tp-stat-val">{TAILOR.responseTime}</div>
                <div className="tp-stat-lbl">Response Time</div>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="tp-tabs">
            {['about', 'services', 'portfolio', 'reviews'].map(t => (
              <button
                key={t}
                className={`tp-tab ${activeTab === t ? 'active' : ''}`}
                onClick={() => setActiveTab(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* ── ABOUT ── */}
          {activeTab === 'about' && (
            <div className="tp-section tp-anim">
              <div className="tp-about-grid">
                <div className="tp-about-text">
                  <h2 className="tp-section-title text1">About <span className="text-capsule-blue">Ibrahim</span></h2>
                  {TAILOR.about.split('\n\n').map((p, i) => (
                    <p key={i} className="tp-about-p">{p}</p>
                  ))}
                </div>
                <div className="tp-about-meta">
                  <div className="tp-meta-card">
                    <div className="tp-meta-row">
                      <span className="tp-meta-icon">📍</span>
                      <div>
                        <div className="tp-meta-label">Coverage Area</div>
                        <div className="tp-meta-val">{TAILOR.coverage}</div>
                      </div>
                    </div>
                    <div className="tp-meta-row">
                      <span className="tp-meta-icon">🗣️</span>
                      <div>
                        <div className="tp-meta-label">Languages</div>
                        <div className="tp-meta-val">{TAILOR.languages.join(', ')}</div>
                      </div>
                    </div>
                    <div className="tp-meta-row">
                      <span className="tp-meta-icon">🏠</span>
                      <div>
                        <div className="tp-meta-label">Visit Type</div>
                        <div className="tp-meta-val">Home Visit + Studio</div>
                      </div>
                    </div>
                    <div className="tp-meta-row">
                      <span className="tp-meta-icon">⏱️</span>
                      <div>
                        <div className="tp-meta-label">Responds In</div>
                        <div className="tp-meta-val">{TAILOR.responseTime}</div>
                      </div>
                    </div>
                  </div>
                  <div className="tp-expertise">
                    <div className="tp-exp-title">Expertise</div>
                    {[
                      { label: 'Wedding & Bridal Wear', pct: 96 },
                      { label: 'Traditional Sherwani',  pct: 92 },
                      { label: 'Formal Suiting',        pct: 88 },
                      { label: 'Indo-Western Fusion',   pct: 80 },
                    ].map(e => (
                      <div key={e.label} className="tp-exp-item">
                        <div className="tp-exp-row">
                          <span>{e.label}</span><span>{e.pct}%</span>
                        </div>
                        <div className="tp-exp-track">
                          <div className="tp-exp-fill" style={{ width: `${e.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SERVICES ── */}
          {activeTab === 'services' && (
            <div className="tp-section tp-anim">
              <h2 className="tp-section-title text1">Services & <span className="text-capsule-blue">Pricing</span></h2>
              <p className="tp-section-sub">All prices are starting rates. Final quote given after measurements.</p>
              <div className="tp-services-grid">
                {SERVICES.map((s, i) => (
                  <div key={i} className="tp-service-card">
                    {s.tag && <div className="tp-service-tag">{s.tag}</div>}
                    <div className="tp-service-icon">{s.icon}</div>
                    <div className="tp-service-name">{s.name}</div>
                    <div className="tp-service-price">{s.price}</div>
                    <div className="tp-service-time">⏱ {s.time}</div>
                    <button className="tp-service-btn" onClick={() => navigate('/booking')}>Book →</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PORTFOLIO ── */}
          {activeTab === 'portfolio' && (
            <div className="tp-section tp-anim">
              <h2 className="tp-section-title text1">Portfolio <span className="text-capsule-blue">Work</span></h2>
              <p className="tp-section-sub">Sample work — real outfit images added once tailors upload their portfolio.</p>
              <div className="tp-portfolio-grid">
                {PORTFOLIO.map((p, i) => (
                  <div key={i} className="tp-portfolio-item" style={{ background: p.bg }}>
                    <div className="tp-portfolio-icon">{p.icon}</div>
                    <div className="tp-portfolio-overlay">
                      <span>{p.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── REVIEWS ── */}
          {activeTab === 'reviews' && (
            <div className="tp-section tp-anim">
              <div className="tp-reviews-header">
                <h2 className="tp-section-title text1">What Clients <span className="text-capsule-blue">Say</span></h2>
                <div className="tp-rating-summary">
                  <div className="tp-rs-number">4.9</div>
                  <div>
                    <div className="tp-rs-stars">★★★★★</div>
                    <div className="tp-rs-count">{TAILOR.reviews} verified reviews</div>
                  </div>
                </div>
              </div>
              <div className="tp-reviews-list">
                {(showAll ? REVIEWS : REVIEWS.slice(0, 2)).map((r, i) => (
                  <div key={i} className="tp-review-card">
                    <div className="tp-review-top">
                      <div className="tp-rev-av" style={{ background: r.bg }}>{r.init}</div>
                      <div className="tp-rev-info">
                        <div className="tp-rev-name">{r.name}</div>
                        <div className="tp-rev-date">{r.time}</div>
                      </div>
                      <div className="tp-rev-stars">{'★'.repeat(r.stars)}</div>
                    </div>
                    <div className="tp-rev-outfit">👔 {r.outfit}</div>
                    <p className="tp-rev-text">{r.text}</p>
                  </div>
                ))}
              </div>
              {!showAll && (
                <button className="tp-show-more" onClick={() => setShowAll(true)}>
                  Show all {TAILOR.reviews} reviews →
                </button>
              )}
            </div>
          )}

        </div>

        {/* ══ RIGHT SIDEBAR ══ */}
        <aside className="tp-sidebar">

          {/* BOOKING CARD */}
          <div className="tp-book-card">
            <div className="tp-book-top">
              <div className="tp-book-price-row">
                <div>
                  <div className="tp-book-label">Home Visit Fee</div>
                  <div className="tp-book-price">₹299</div>
                  <div className="tp-book-sub">Stitching priced after measurements</div>
                </div>
                <div className="tp-book-rating">
                  <div className="tp-br-num">4.9</div>
                  <div className="tp-br-stars">★★★★★</div>
                  <div className="tp-br-count">{TAILOR.reviews} reviews</div>
                </div>
              </div>
              <div className="tp-available-badge">
                <span className="tp-avail-dot" />
                Available this week · Next slot: Tomorrow
              </div>
            </div>

            <button className="tp-cta-primary" onClick={() => navigate('/booking')}>
              Place An Order6 →
            </button>
            <button className="tp-cta-secondary">Send Message</button>

            <div className="tp-trust-list">
              <div className="tp-trust-item">🔒 Verified & background-checked tailor</div>
              <div className="tp-trust-item">📐 Precise home measurements</div>
              <div className="tp-trust-item">🚚 Outfit delivered in 48–72 hrs</div>
              <div className="tp-trust-item">↩️ Free alterations if fit is off</div>
            </div>
          </div>

          {/* QUICK STATS */}
          <div className="tp-quick-stats">
            <div className="tp-qs-title">Performance</div>
            <div className="tp-qs-grid">
              {[
                { val: '99%',  lbl: 'On-Time' },
                { val: '500+', lbl: 'Outfits' },
                { val: '4.9★', lbl: 'Rating'  },
                { val: '22yr', lbl: 'Exp.'    },
              ].map((s, i) => (
                <div key={i} className="tp-qs-item">
                  <div className="tp-qs-val">{s.val}</div>
                  <div className="tp-qs-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>

        </aside>
      </div>

      {/* MOBILE BOTTOM BAR */}
      <div className="tp-mobile-bar">
        <div className="tp-mb-info">
          <div className="tp-mb-label">Visit Fee</div>
          <div className="tp-mb-price">₹299</div>
        </div>
        <button className="tp-mb-btn" onClick={() => navigate('/booking')}>
          Book Home Visit →
        </button>
      </div>

    </div>
  );
}