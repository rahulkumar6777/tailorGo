import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const getRedirectPath = (role) => {
  if (role === "customer") return "/booking";
  if (role === "tailor") return "/tailor-profile";
  return "/";
};

export default function PublicOnlyRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div className="route-loading">Checking your session...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to={getRedirectPath(user?.role)} replace />;
  }

  return children;
}
