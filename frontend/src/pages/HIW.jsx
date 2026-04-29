import React from "react";
import "../styles/hiw.css";
import card1 from"../assets/card1.jpg"
import card2 from"../assets/card2.jpg"
import card3 from"../assets/card3.jpg"
// import tape from"../assets/tape.png"

function HIW() {
  return (
    <section className="hiw">
      <div className="hiw-container">

        <h2 className="text2 f-22">Simple Process</h2>
        <h3 className="text1 f-28">HOW IT <span className="text-capsule-blue">Works</span></h3>

        <div className="stack">

          <div className="card card-1">
            <div className="card-inner">
              <span className="step-no">01</span>
              <h3>Post Your Requirement</h3>
              <p>Tell us what you want stitched or upload a design.</p>
            </div>
            <img className="card-img" src={card1} alt="" />
          </div>


          <div className="card card-2">
            <div className="card-inner">
              <span className="step-no">02</span>
              <h3>Get Tailor Offers</h3>
              <p>Nearby tailors send pricing, timelines & details.</p>
            </div>
             <img className="card-img" src={card2} alt="" />
          </div>

          <div className="card card-3">
            <div className="card-inner">
              <span className="step-no">03</span>
              <h3>Choose & Relax</h3>
              <p>Select the best tailor and enjoy doorstep service.</p>
            </div>
             <img className="card-img" src={card3} alt="" />
          </div>

        </div>

      </div>
    </section>
  );
}

export default HIW;