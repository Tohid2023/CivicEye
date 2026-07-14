import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../../services/notificationService";
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
  Bell,
  MessageSquare,
  Calendar,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { cn } from "../../lib/utils";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authUser, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      if (!isAuthenticated || !authUser) return;
      const data = await getNotifications();
      if (data && data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n) => !n.isRead).length);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && authUser) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, authUser]);

  useEffect(() => {
    if (!isAuthenticated || !authUser) return;

    // Connect to notification socket
    const socket = io("http://localhost:8080");

    // Join the personal room for notifications
    socket.emit("join_user", authUser._id);

    // Listen for new real-time notifications
    socket.on("notification", (notif) => {
      console.info("[Socket] Received real-time notification in Navbar:", notif);
      setNotifications((prev) => {
        // Avoid duplicate appends
        if (prev.some((n) => n._id === notif._id)) return prev;
        return [notif, ...prev];
      });
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, authUser]);

  // Real-time sync event from ChatWindow
  useEffect(() => {
    const handleNotificationsRead = () => {
      fetchNotifications();
    };

    window.addEventListener("notifications_read", handleNotificationsRead);
    return () => {
      window.removeEventListener("notifications_read", handleNotificationsRead);
    };
  }, [isAuthenticated, authUser]);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleDeleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications((prev) => {
        const target = prev.find((n) => n._id === id);
        const wasUnread = target && !target.isRead;
        const filtered = prev.filter((n) => n._id !== id);
        if (wasUnread) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return filtered;
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await markNotificationRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Error marking notification read on redirect:", error);
      }
    }
    
    setIsNotifOpen(false);

    // Redirect logic based on notification type
    const bookingId = notif.booking?._id || notif.booking;
    if (notif.type === "chat") {
      navigate(`/live-tracking/${bookingId}`);
    } else if (notif.type === "booking") {
      if (authUser.role === "helper") {
        navigate("/helper-requests");
      } else {
        navigate("/my-bookings");
      }
    } else if (notif.type === "completed") {
      if (authUser.role === "user") {
        navigate("/rating");
      } else {
        navigate("/my-bookings");
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const renderDropdown = () => (
    <AnimatePresence>
      {isNotifOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 glass bg-white/95 border border-slate-200/50 shadow-2xl rounded-3xl p-4 z-50 overflow-hidden flex flex-col max-h-[480px]"
          >
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200/50">
              <span className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                Notifications
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-wider cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[100px] max-h-[350px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                  <Bell size={28} className="text-slate-300 mb-2" />
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    No Notifications
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
                    We'll notify you here when bookings or messages arrive!
                  </p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const NotifIcon =
                    notif.type === "chat"
                      ? MessageSquare
                      : notif.type === "completed"
                      ? CheckCircle2
                      : Calendar;

                  const iconColor =
                    notif.type === "chat"
                      ? "text-blue-500 bg-blue-50"
                      : notif.type === "completed"
                      ? "text-emerald-500 bg-emerald-50"
                      : "text-amber-500 bg-amber-50";

                  return (
                    <div
                      key={notif._id}
                      onClick={() => handleNotificationClick(notif)}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 group relative border text-left",
                        notif.isRead
                          ? "bg-transparent hover:bg-slate-50 border-transparent"
                          : "bg-blue-50/40 hover:bg-blue-50/60 border-blue-100/50"
                      )}
                    >
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", iconColor)}>
                        <NotifIcon size={16} />
                      </div>

                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs leading-none truncate font-bold text-slate-900">
                            {notif.title}
                          </p>
                          {!notif.isRead && (
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] font-semibold text-slate-500 mt-1 leading-snug break-words">
                          {notif.message}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
                          {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}{" "}
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <button
                        onClick={(e) => handleDeleteNotification(notif._id, e)}
                        className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

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
              
              {/* Notification Bell */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition-colors relative cursor-pointer"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </motion.button>
                {renderDropdown()}
              </div>

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
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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

        {/* Mobile Bell and Toggle */}
        <div className="flex items-center gap-1 md:hidden">
          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors relative cursor-pointer"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
              {renderDropdown()}
            </div>
          )}
          <button
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
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
