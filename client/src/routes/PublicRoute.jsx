import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = ({ children }) => {
  const { authUser, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="p-10 text-center text-lg font-semibold">Loading...</div>;
  }

  if (isAuthenticated) {
    if (authUser?.role === "helper") {
      return <Navigate to="/helpers" replace />;
    }

    if (authUser?.role === "admin") {
      return <Navigate to="/admin-dashboard" replace />;
    }

    return <Navigate to="/home" replace />;
  }

  return children;
};

export default PublicRoute;