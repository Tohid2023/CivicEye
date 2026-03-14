import React from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import ReportIssue from "../pages/ReportIssue";
import Helpers from "../pages/Helpers";
import HelperProfile from "../pages/HelperProfile";
import Booking from "../pages/Booking";
import Rating from "../pages/Rating";
import AdminLogin from "../pages/admin/AdminLogin";
import Dashboard from "../pages/admin/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      <Route
        path="/home"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/report"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <ReportIssue />
          </ProtectedRoute>
        }
      />

      <Route
        path="/helpers"
        element={
          <ProtectedRoute allowedRoles={["user", "helper"]}>
            <Helpers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/helper-profile"
        element={
          <ProtectedRoute allowedRoles={["user", "helper"]}>
            <HelperProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/booking"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <Booking />
          </ProtectedRoute>
        }
      />

      <Route
        path="/rating"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <Rating />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-login"
        element={
          <PublicRoute>
            <AdminLogin />
          </PublicRoute>
        }
      />

      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;