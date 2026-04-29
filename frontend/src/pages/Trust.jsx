import React from "react";
import "../styles/trust.css";
import expert from "../assets/expert.png"
import fast from "../assets/fast.png"
import doorstep from "../assets/doorstep.png"
import toprated from "../assets/toprated.png"
// import { ReactComponent as Fast } from "../assets/fast.svg"

function Trust() {
  return (
    <section className="trust">
      <div className="trust-container">

        <div className="trust-grid">

          <div className="trust-left">
            <h2 className="text2 f-22">Why Choose Us</h2>

     <h3 className="text1 f-28"> Tailoring, <span className="text-capsule-blue">Reimagined</span></h3>

            <p className="trust-desc">
              We connect you with skilled local tailors, simplify the process,
              and bring premium craftsmanship directly to your doorstep —
              without the hassle of traditional tailoring.
            </p>
          </div>

   
          <div className="trust-right">

            <div className="trust-card">
              <div className="icon">
              <img src={expert} alt="" />
              </div>
              <div>
                <h3>Verified Experts</h3>
                <p>Every tailor is hand-verified to ensure quality and reliability.</p>
              </div>
            </div>

            <div className="trust-card">
                        <div className="icon">
          <img src={fast} alt="" />
              </div>
              <div>
                <h3>Fast Turnaround</h3>
                <p>Get perfectly fitted outfits delivered within 48 hours.</p>
              </div>
            </div>

            <div className="trust-card">
              <div className="icon">
              <img src={doorstep} alt="" />
              </div>
              <div>
                <h3>Doorstep Service</h3>
                <p>No more shop visits — tailoring comes to your home.</p>
              </div>
            </div>

            <div className="trust-card">
                        <div className="icon">
              <img src={toprated} alt="" />
              </div>
              <div>
                <h3>Top Rated Experience</h3>
                <p>Loved by customers for convenience and craftsmanship.</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default Trust;