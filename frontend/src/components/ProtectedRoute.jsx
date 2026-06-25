import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isAuthReady } = useAuth();
  const location = useLocation();

  if (!isAuthReady) {
    return <div className="route-loading">Checking session…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
