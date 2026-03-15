import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { authUser, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          CivicEye
        </Link>

        <div className="hidden md:flex gap-6 text-sm font-medium text-slate-700 items-center">
          {!isAuthenticated && (
            <>
              <Link to="/">Home</Link>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}

          {isAuthenticated && authUser?.role === "user" && (
            <>
              <Link to="/home" className="hover:text-blue-600">
                Home
              </Link>
              <Link to="/report" className="hover:text-blue-600">
                Report
              </Link>
              <Link to="/helpers" className="hover:text-blue-600">
                Helpers
              </Link>
              <Link to="/rating" className="hover:text-blue-600">
                Rating
              </Link>
            </>
          )}

          {isAuthenticated && authUser?.role === "helper" && (
            <>
              <Link to="/helpers" className="hover:text-blue-600">
                Helpers
              </Link>
              <Link to="/helper-profile" className="hover:text-blue-600">
                Profile
              </Link>
            </>
          )}

          {isAuthenticated && authUser?.role === "helper" && (
            <>
              <Link to="/helper-requests" className="hover:text-blue-600">
                Requests
              </Link>
              <Link to="/helpers" className="hover:text-blue-600">
                Helpers
              </Link>
              <Link to="/helper-profile" className="hover:text-blue-600">
                Profile
              </Link>
            </>
          )}

          {isAuthenticated && (
            <>
              <span className="text-slate-500">
                {authUser?.fullName || "User"}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-xl bg-red-500 px-4 py-2 text-white"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
