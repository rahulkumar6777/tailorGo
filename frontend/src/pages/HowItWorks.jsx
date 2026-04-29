import React from 'react';
import "../styles/howitworks-page.css";

const HowItWorks = () => {
  return (
    <div className="hiw-page-final">
      {/* BACKGROUND ELEMENTS - Texture for depth */}
      <div className="bg-blur-glow"></div>
      <div className="stitch-pattern-overlay"></div>

      <div className="hiw-max-container">
        
        {/* --- HEADER SECTION --- */}
        <header className="hiw-main-header">
          <div className="capsule-row">
            <span className="premium-tag">Digital Atelier</span>
            <span className="premium-tag-outline">Bespoke 2.0</span>
          </div>
          <h1 className="text1 main-title">
            The <span className="font-accent-italic">Art</span> of the Connection
          </h1>
          <p className="text3 hero-subtitle">
            We’ve removed the middleman. Now, you’re directly connected to the world’s finest masters in four surgical steps.
          </p>
        </header>

        {/* --- DENSE BENTO GRID (Step 1 & 2) --- */}
        <section className="hiw-bento-grid">
          
          {/* STEP 1: UPLOAD */}
          <div className="bento-card step-01 glass-card">
            <div className="bento-header">
              <span className="step-count">01</span>
              <h3 className="text4">Upload Blueprint</h3>
            </div>
            <p className="text6">Post your design, inspiration, or a rough sketch. Our AI extracts technical specs instantly.</p>
            <div className="visual-asset sketch-anim">
              <div className="sketch-line"></div>
              <div className="sketch-line"></div>
            </div>
          </div>

          {/* STEP 2: BROADCAST (THE POWERHOUSE SECTION) */}
          <div className="bento-card step-02 indigo-card">
            <div className="radar-circle">
              <div className="ping"></div>
              <div className="ping delay-1"></div>
              <div className="ping delay-2"></div>
              <div className="center-node">📡</div>
            </div>
            <div className="bento-text">
               <span className="status-live">LIVE BROADCAST</span>
               <h3 className="text4 white">Hyper-Local Matching</h3>
               <p className="text6 gray">Your request is pulsed to every Master Tailor within 10km. Only the specialized accept.</p>
            </div>
          </div>

          {/* STEP 3: COMPARISON */}
          <div className="bento-card step-03 white-card shadow-xl">
             <div className="bento-header">
                <span className="step-count">03</span>
                <h3 className="text4">Bid & Select</h3>
             </div>
             <div className="mock-bids">
                <div className="bid-row"><span>Master Ibrahim</span> <b>Acceptance Sent</b></div>
                <div className="bid-row highlight"><span>Elite Stitching</span> <b>Best Match</b></div>
             </div>
             <p className="text6">Compare ratings, portfolios, and real-time quotes. You hold the shears.</p>
          </div>

          {/* STEP 4: DELIVERY */}
          <div className="bento-card step-04 glass-card">
            <div className="bento-header">
              <span className="step-count">04</span>
              <h3 className="text4">Doorstep Fitting</h3>
            </div>
            <p className="text6">Professional measurement at your home. Finished garment delivered in 7 days.</p>
            <div className="delivery-truck">📦 ➔ 🏠</div>
          </div>
        </section>

        {/* --- DENSITY REINFORCEMENT: STATS BAR --- */}
        <div className="density-stats-bar">
           <div className="stat-unit"><b>10km</b><p>Broadcast Radius</p></div>
           <div className="stat-divider"></div>
           <div className="stat-unit"><b>500+</b><p>Verified Masters</p></div>
           <div className="stat-divider"></div>
           <div className="stat-unit"><b>100%</b><p>Fit Guarantee</p></div>
        </div>

        {/* --- FINAL CTA --- */}
        <footer className="hiw-footer-action">
          <div className="dark-cta-box">
             <h2 className="text2 white">Ready to start your <span className="font-accent-italic">Bespoke</span> story?</h2>
             <button className="ultra-btn">Create Your First Order</button>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default HowItWorks;