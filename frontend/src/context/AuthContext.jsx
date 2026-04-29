import { useCallback, useEffect, useMemo, useState } from "react";
import { authApi, refreshAuth } from "../lib/api";
import { AuthContext } from "./auth-context";

const decodeJwtPayload = (token) => {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyAccessToken = useCallback((accessToken, fallbackRole) => {
    const payload = decodeJwtPayload(accessToken);
    const nextUser = {
      id: payload?._id || null,
      role: payload?.role || fallbackRole || null,
    };

    setUser(nextUser);
    localStorage.setItem("tailorgo_auth", JSON.stringify(nextUser));

    return nextUser;
  }, []);

  const refreshSession = useCallback(async (fallbackRole) => {
    const data = await refreshAuth();
    return applyAccessToken(data?.accessToken, fallbackRole);
  }, [applyAccessToken]);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        await refreshSession();
      } catch {
        localStorage.removeItem("tailorgo_auth");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [refreshSession]);

  const loginCustomer = useCallback(async (payload) => {
    const data = await authApi.userLogin(payload);
    return applyAccessToken(data?.accessToken, "customer");
  }, [applyAccessToken]);

  const loginTailor = useCallback(async (payload) => {
    const data = await authApi.tailorLogin(payload);
    return applyAccessToken(data?.accessToken, "tailor");
  }, [applyAccessToken]);

  const clearSession = useCallback(() => {
    localStorage.removeItem("tailorgo_auth");
    setUser(null);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      refreshSession,
      loginCustomer,
      loginTailor,
      logout,
      clearSession,
    }),
    [user, loading, refreshSession, loginCustomer, loginTailor, logout, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
