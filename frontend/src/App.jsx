import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import "./index.css";

import Nav from "./pages/Nav";
import Footer from "./pages/Footer";

import Hero from "./pages/Hero";
import HIW from "./pages/HIW";
import TailorSection from "./pages/Tailors";
import Trust from "./pages/Trust";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import TailorProfile from "./pages/TailorProfile";
import TailorLogin from "./pages/TailorLogin";
import TailorSignup from "./pages/TailorSignup";
import Booking from "./pages/Booking";
import CustomerOrders from "./pages/CustomerOrders";
import OrderDetails from "./pages/OrderDetails";
import TailorRequests from "./pages/TailorRequests";
import HowItWorks from "./pages/HowItWorks";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import { tailorApi } from "./lib/api";

function Home() {
  const [tailorSearch, setTailorSearch] = useState({
    loading: false,
    error: "",
    results: null,
  });

  const handleFindTailors = async (filters) => {
    setTailorSearch({ loading: true, error: "", results: null });

    try {
      const response = await tailorApi.findTailors(filters);
      setTailorSearch({
        loading: false,
        error: "",
        results: response?.data || [],
      });

      window.setTimeout(() => {
        document.getElementById("find-tailors")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } catch (error) {
      setTailorSearch({
        loading: false,
        error: error.message,
        results: [],
      });
    }
  };

  return (
    <>
      <Hero onFindTailors={handleFindTailors} loading={tailorSearch.loading} />
      <HIW />
      <TailorSection
        tailors={tailorSearch.results}
        loading={tailorSearch.loading}
        error={tailorSearch.error}
      />
      <Trust />
    </>
  );
}

function App() {
  return (
    <>
      <Nav />

      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
          <Route
            path="/tailor-profile"
            element={
              <ProtectedRoute allowedRoles={["tailor"]} loginPath="/tailor-login">
                <TailorProfile />
              </ProtectedRoute>
            }
          />
          <Route path="/tailor-login" element={<PublicOnlyRoute><TailorLogin /></PublicOnlyRoute>} />
          <Route path="/tailor-signup" element={<PublicOnlyRoute><TailorSignup /></PublicOnlyRoute>} />
          <Route
            path="/booking"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Booking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <CustomerOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:orderId"
            element={
              <ProtectedRoute allowedRoles={["customer", "tailor"]}>
                <OrderDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tailor-requests"
            element={
              <ProtectedRoute allowedRoles={["tailor"]} loginPath="/tailor-login">
                <TailorRequests />
              </ProtectedRoute>
            }
          />
          <Route path="/HIW" element={<HowItWorks />} />
        </Routes>
      </div>

      <Footer />
    </>
  );
}

export default App;
