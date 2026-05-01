import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/nav.css";
import logo from "../assets/logo.png";
import { useAuth } from "../context/useAuth";

function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { user, loading, isAuthenticated, logout } = useAuth();

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await logout();
      closeMenu();
      navigate("/", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  const renderActions = (mobile = false) => {
    const classSuffix = mobile ? " mob-btn" : "";

    if (loading) {
      return <span className={`nav-session${classSuffix}`}>Checking...</span>;
    }

    if (!isAuthenticated) {
      return (
        <>
          <Link to="/tailor-login" className={`btn-secondary${classSuffix}`} onClick={closeMenu}>
            Partner Login
          </Link>
          <Link to="/login" className={`btn-primary${classSuffix}`} onClick={closeMenu}>
            Book Now
          </Link>
        </>
      );
    }

    if (user?.role === "tailor") {
      return (
        <>
          <Link to="/tailor-requests" className={`btn-secondary${classSuffix}`} onClick={closeMenu}>
            Requests
          </Link>
          <Link to="/tailor-profile" className={`btn-secondary${classSuffix}`} onClick={closeMenu}>
            Tailor Profile
          </Link>
          <button className={`btn-primary nav-button${classSuffix}`} onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? "Signing Out" : "Logout"}
          </button>
        </>
      );
    }

    return (
      <>
        <Link to="/orders" className={`btn-secondary${classSuffix}`} onClick={closeMenu}>
          My Orders
        </Link>
        <Link to="/booking" className={`btn-secondary${classSuffix}`} onClick={closeMenu}>
          New Order
        </Link>
        <button className={`btn-primary nav-button${classSuffix}`} onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? "Signing Out" : "Logout"}
        </button>
      </>
    );
  };

  return (
    <nav className="navbar">
      <div className="nav-container max-w">
        <Link to="/" className="logo" onClick={closeMenu}>
          <img src={logo} alt="TailorGo" />
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          Menu
        </button>

        <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
          <li>
            <Link to="/HIW" onClick={closeMenu}>
              How it Works
            </Link>
          </li>
          <li>
            <a href="/#find-tailors" onClick={closeMenu}>
              Find Tailors
            </a>
          </li>
          <li>
            <a href="/#pricing" onClick={closeMenu}>
              Pricing
            </a>
          </li>
          {renderActions(true)}
        </ul>

        <div className="nav-actions">{renderActions()}</div>
      </div>
    </nav>
  );
}

export default Nav;
