import React, { useState } from "react";
import "../styles/hero.css";
import img1 from "../assets/img1.png";
import img3 from "../assets/img3.png";
import tshirt from "../assets/tshirt.png";
import shirt from "../assets/shirt.png";
import kurta from "../assets/kurta.png";

const OUTFITS = ["Sherwani", "Suit", "Kurta", "Blouse", "Shirt", "Alteration"];

function Hero({ onFindTailors, loading = false }) {
  const [location, setLocation] = useState("");
  const [outfit, setOutfit] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState("");

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Location is not supported in this browser.");
      return;
    }

    setLocating(true);
    setMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocation("Current location");
        setLocating(false);
      },
      () => {
        setMessage("Could not read your location. Enter city or area manually.");
        setLocating(false);
      },
    );
  };

  const handleLocationChange = (event) => {
    setLocation(event.target.value);
    setCoordinates(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const hasManualLocation = location.trim() && location !== "Current location";
    const hasCoordinates = Boolean(coordinates?.lat && coordinates?.lng);
    const hasOutfit = Boolean(outfit);

    if (!hasManualLocation && !hasCoordinates && !hasOutfit) {
      setMessage("Enter a location, use current location, or select an outfit.");
      return;
    }

    setMessage("");

    onFindTailors?.({
      location: hasManualLocation ? location.trim() : "",
      outfit,
      lat: hasCoordinates ? coordinates.lat : "",
      lng: hasCoordinates ? coordinates.lng : "",
      radius: hasCoordinates ? 10 : "",
    });
  };

  return (
    <section className="hero">
      <div className="bg-img">
        <img src={img1} alt="" />
      </div>
      <div className="bg-img2">
        <img src={img3} alt="" />
      </div>

      <div className="hero-container">
        <div className="hero-content">
          <p className="text2 f-22">The Modern Atelier</p>
          <h1 className="head-text">
            Master Tailors. <br />
            At Your <span className="text-capsule">Doorstep.</span>
          </h1>
          <p className="text3">
            The first on-demand marketplace for bespoke Indian wear. Find a nearby tailor,
            book a home visit, and get perfectly fitted in 48 hours.
          </p>

          <form className="action-bar" onSubmit={handleSubmit}>
            <label className="hero-input-group location-field">
              <span className="search-label">Location</span>
              <div className="search-control">
                <input
                  type="text"
                  placeholder="City, area, or shop"
                  value={location}
                  onChange={handleLocationChange}
                />
                <button
                  type="button"
                  className="location-btn"
                  onClick={handleUseCurrentLocation}
                  disabled={locating}
                >
                  {locating ? "Finding..." : "Use current"}
                </button>
              </div>
            </label>

            <label className="hero-input-group outfit-field">
              <span className="search-label">Outfit</span>
              <select value={outfit} onChange={(event) => setOutfit(event.target.value)}>
                <option value="">Select Outfit</option>
                {OUTFITS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <button className="btn-primary-hero text5" type="submit" disabled={loading}>
              {loading ? "Searching..." : "Find Tailors"}
            </button>
          </form>

          {message && <div className="hero-search-message">{message}</div>}

          <div className="hero-trust-line">
            <p className="text3">
              <span className="creative-badge">500+</span> Verified Masters,
              Starts at <span className="creative-price">Rs. 299</span>.
              Book your tailor <span className="creative-now">now.</span>
            </p>
          </div>
        </div>
      </div>

      <section className="atelier-collection">
        <h3 className="text1 f-28">
          What Are We <span className="text-capsule-blue">Stitching</span> Today
        </h3>
        <div className="product-grid">
          <div className="product-card">
            <div className="icon-box">
              <img src={tshirt} alt="Kurta icon" />
            </div>
            <p className="item-name">Bespoke Kurta</p>
          </div>

          <div className="product-card">
            <div className="icon-box">
              <img src={kurta} alt="Suit icon" />
            </div>
            <p className="item-name">Master Kurta</p>
          </div>

          <div className="product-card">
            <div className="icon-box">
              <img src={shirt} alt="Shirt icon" />
            </div>
            <p className="item-name">Custom Shirt</p>
          </div>
        </div>
      </section>
    </section>
  );
}

export default Hero;
