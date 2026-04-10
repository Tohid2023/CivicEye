import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  Menu,
  X,
  Home,
  PlusCircle,
  ClipboardList,
  Users,
  Star,
  LayoutDashboard,
  UserCircle,
} from "lucide-react";
import { cn } from "../../lib/utils";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authUser, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = {
    user: [
      { name: "Home", path: "/home", icon: Home },
      { name: "Report", path: "/report", icon: PlusCircle },
      { name: "My Issues", path: "/my-issues", icon: ClipboardList },
      { name: "Helpers", path: "/helpers", icon: Users },
      { name: "Rating", path: "/rating", icon: Star },
      { name: "My Bookings", path: "/my-bookings", icon: ClipboardList },
    ],
    helper: [
      { name: "Requests", path: "/helper-requests", icon: ClipboardList },
      { name: "Profile", path: "/helper-profile", icon: UserCircle },
    ],
    admin: [
      { name: "Dashboard", path: "/admin-dashboard", icon: LayoutDashboard },
    ],
    public: [
      { name: "Home", path: "/", icon: Home },
      { name: "Login", path: "/login", icon: null },
      { name: "Register", path: "/register", icon: null },
    ],
  };

  const currentLinks = isAuthenticated
    ? navLinks[authUser?.role] || []
    : navLinks.public;

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-3",
        scrolled
          ? "bg-white/80 backdrop-blur-md shadow-lg py-2"
          : "bg-transparent",
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 10 }}
            className="bg-blue-600 p-1.5 rounded-lg shadow-lg"
          >
            <img
              src="/CE_icon.png"
              alt="CivicEye"
              className="h-7 w-auto brightness-0 invert"
            />
          </motion.div>
          <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
            Civic
            <span className="text-blue-600 group-hover:text-slate-900">
              Eye
            </span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {currentLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                location.pathname === link.path
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              {link.name}
            </Link>
          ))}

          {isAuthenticated ? (
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-200">
              <div className="flex flex-col items-end">
                <span className="text-xs font-semibold text-slate-900 leading-none">
                  {authUser?.fullName}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                  {authUser?.role}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={20} />
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-4">
              <Link
                to="/admin-login"
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Admin
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white shadow-xl border-t border-slate-100 p-4 flex flex-col gap-2 md:hidden"
          >
            {currentLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-xl text-base font-medium flex items-center gap-3",
                  location.pathname === link.path
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50",
                )}
              >
                {link.icon && <link.icon size={20} />}
                {link.name}
              </Link>
            ))}
            {isAuthenticated && (
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="mt-2 px-4 py-3 rounded-xl text-red-600 font-medium flex items-center gap-3 hover:bg-red-50"
              >
                <LogOut size={20} />
                Logout
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
