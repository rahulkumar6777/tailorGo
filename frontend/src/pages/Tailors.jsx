import React from "react";
import "../styles/tailors.css";
import { Link } from "react-router-dom";

const fallbackImages = [
  "https://plus.unsplash.com/premium_photo-1683140721927-aaed410fae29?q=80&w=870&auto=format&fit=crop",
  "https://plus.unsplash.com/premium_photo-1683129663272-6a157e9c493c?q=80&w=870&auto=format&fit=crop",
  "https://plus.unsplash.com/premium_photo-1663047237571-fec4456a40a2?q=80&w=870&auto=format&fit=crop",
];

const curatedTailors = [
  {
    id: 1,
    fullName: "Master Ibrahim",
    yearsOfExperience: 22,
    rating: 4.9,
    servicesOffered: [{ serviceType: "Sherwani" }, { serviceType: "Suits" }],
    image: fallbackImages[0],
  },
  {
    id: 2,
    fullName: "Master Savita",
    yearsOfExperience: 15,
    rating: 4.8,
    servicesOffered: [{ serviceType: "Lehenga" }, { serviceType: "Blouse" }],
    image: fallbackImages[1],
  },
  {
    id: 3,
    fullName: "Master Rahil",
    yearsOfExperience: 12,
    rating: 5,
    servicesOffered: [{ serviceType: "Kurta" }, { serviceType: "Pathani" }],
    image: fallbackImages[2],
  },
];

const formatTailor = (tailor, index) => ({
  id: tailor._id || tailor.id || tailor.username || index,
  name: tailor.shopName || tailor.fullName || "TailorGo Partner",
  exp: tailor.yearsOfExperience ? `${tailor.yearsOfExperience} Yrs Exp` : "Verified Tailor",
  rating: Number(tailor.rating || 0).toFixed(1),
  tags: (tailor.servicesOffered || []).map((service) => service.serviceType).filter(Boolean).slice(0, 3),
  img: tailor.image || fallbackImages[index % fallbackImages.length],
  distance: tailor.distance,
  minPrice: tailor.minPrice,
});

function TailorSection({ tailors, loading = false, error = "" }) {
  const hasSearched = Array.isArray(tailors);
  const visibleTailors = (hasSearched ? tailors : curatedTailors).map(formatTailor);

  return (
    <section className="tailor-wrapper max-w" id="find-tailors">
      <div className="tailor-header">
        <h2 className="text2 f-22">{hasSearched ? "Search results" : "Curated for you"}</h2>
        <h3 className="text1 f-28">
          Master Tailors <span className="text-capsule-blue">Nearby</span>
        </h3>
        {error && <p className="tailor-state error">{error}</p>}
        {loading && <p className="tailor-state">Finding the best matches...</p>}
      </div>

      {!loading && hasSearched && visibleTailors.length === 0 && (
        <div className="tailor-empty">
          No tailors found for this search. Try another location or outfit.
        </div>
      )}

      {visibleTailors.length > 0 && (
        <div className="tailor-grid">
          {visibleTailors.map((tailor) => (
            <div key={tailor.id} className="master-card">
              <div className="card-top">
                <img src={tailor.img} alt={tailor.name} className="master-img" />
                <div className="card-overlay">
                  <span className="badge-exp text6">{tailor.exp}</span>
                </div>
              </div>

              <div className="card-body">
                <div className="card-title-row">
                  <h3 className="text4">{tailor.name}</h3>
                  <div className="rating-tag">{tailor.rating}</div>
                </div>

                <div className="tailor-meta-row">
                  {tailor.distance !== null && tailor.distance !== undefined && (
                    <span>{tailor.distance} km away</span>
                  )}
                  {tailor.minPrice && <span>Starts Rs. {tailor.minPrice}</span>}
                </div>

                <div className="tag-container">
                  {(tailor.tags.length ? tailor.tags : ["Custom Stitching"]).map((tag) => (
                    <span key={tag} className="skill-tag text6">
                      {tag}
                    </span>
                  ))}
                </div>

                <Link className="book-btn" to="/booking">
                  <span className="text5">Book Appointment</span>
                  <div className="btn-icon">Go</div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default TailorSection;
