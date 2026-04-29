import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function ProtectedRoute({ children, allowedRoles, loginPath = "/login" }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="route-loading">Checking your session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
