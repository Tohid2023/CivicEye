import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import {
  getHelperBookings,
  updateBookingStatus,
} from "../services/bookingService";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  MapPin,
  Calendar,
  Clock,
  Phone,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  AlertCircle,
  Briefcase,
  ShieldCheck,
  Loader2,
  ChevronDown,
  ChevronUp,
  Filter,
  Sparkles,
  Ban,
} from "lucide-react";
import { cn } from "../lib/utils";

const HelperRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [openRequestId, setOpenRequestId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getHelperBookings();
      setRequests(data.bookings || []);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to fetch helper requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      setUpdatingId(bookingId);
      await updateBookingStatus(bookingId, status);
      await fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update booking status");
    } finally {
      setUpdatingId("");
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "pending":
        return {
          color: "text-amber-600 bg-amber-50 border-amber-100",
          icon: AlertCircle,
        };
      case "accepted":
        return {
          color: "text-emerald-600 bg-emerald-50 border-emerald-100",
          icon: CheckCircle2,
        };
      case "rejected":
        return {
          color: "text-red-600 bg-red-50 border-red-100",
          icon: XCircle,
        };
      case "completed":
        return {
          color: "text-blue-600 bg-blue-50 border-blue-100",
          icon: ShieldCheck,
        };
      case "cancelled":
        return {
          color: "text-slate-600 bg-slate-50 border-slate-100",
          icon: Ban,
        };
      default:
        return {
          color: "text-slate-600 bg-slate-50 border-slate-100",
          icon: Clock,
        };
    }
  };

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === "pending").length,
      accepted: requests.filter((r) => r.status === "accepted").length,
      completed: requests.filter((r) => r.status === "completed").length,
    };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    if (activeFilter === "all") return requests;
    return requests.filter((r) => r.status === activeFilter);
  }, [requests, activeFilter]);

  const leftRequests = filteredRequests.filter((_, index) => index % 2 === 0);
  const rightRequests = filteredRequests.filter((_, index) => index % 2 !== 0);

  const toggleRequest = (id) => {
    setOpenRequestId((prev) => (prev === id ? null : id));
  };

  const RequestCard = ({ booking }) => {
    const status = getStatusConfig(booking.status);
    const StatusIcon = status.icon;
    const isOpen = openRequestId === booking._id;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-dark rounded-[2rem] overflow-hidden border-white/10 shadow-xl"
      >
        <div className="p-6">
          <div onClick={() => toggleRequest(booking._id)} className="cursor-pointer">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/10">
                  <User size={24} />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white leading-tight">
                    {booking.user?.fullName || "Anonymous Citizen"}
                  </h3>

                  <div className="flex items-center gap-1.5 text-blue-300 text-xs font-bold uppercase tracking-wider mt-1">
                    <MapPin size={12} />
                    {booking.user?.village || "Local Area"}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/80">
                      <Calendar size={13} />
                      {booking.preferredDate || "Not set"}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/80">
                      <Clock size={13} />
                      {booking.preferredTime || "Not set"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <div
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border flex items-center gap-1.5",
                    status.color
                  )}
                >
                  <StatusIcon size={12} />
                  {booking.status}
                </div>

                <div className="text-white/50">
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28 }}
                className="overflow-hidden"
              >
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Calendar size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Date
                      </span>
                    </div>
                    <p className="text-white font-bold">
                      {booking.preferredDate || "Not set"}
                    </p>
                  </div>

                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Clock size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Time
                      </span>
                    </div>
                    <p className="text-white font-bold">
                      {booking.preferredTime || "Not set"}
                    </p>
                  </div>
                </div>

                {booking.issue?.description && (
                  <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Issue Description
                    </p>
                    <p className="text-white/85 text-sm leading-relaxed">
                      {booking.issue.description}
                    </p>
                  </div>
                )}

                {booking.issue?.image && (
                  <div className="mt-4 rounded-3xl overflow-hidden border border-white/10 relative h-44">
                    <img
                      src={`http://localhost:8080${booking.issue.image}`}
                      alt="Issue Context"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-widest">
                      <ImageIcon size={14} />
                      Visual Context Attached
                    </div>
                  </div>
                )}

                <div className="mt-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-blue-400">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                        Citizen Contact
                      </p>
                      <p className="text-white font-bold">
                        {booking.user?.phone || "Private Contact"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-emerald-400">
                      <MessageSquare size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                        Observation Note
                      </p>
                      <p className="text-white/80 text-sm italic">
                        "{booking.note || "Proceed with standard inspection."}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleStatusUpdate(booking._id, "accepted")}
                    disabled={updatingId === booking._id || booking.status !== "pending"}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-30 disabled:grayscale"
                  >
                    {updatingId === booking._id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={18} />
                    )}
                    <span className="text-[10px] font-bold uppercase mt-1">
                      Accept
                    </span>
                  </button>

                  <button
                    onClick={() => handleStatusUpdate(booking._id, "rejected")}
                    disabled={updatingId === booking._id || booking.status !== "pending"}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white transition-all disabled:opacity-30 disabled:grayscale"
                  >
                    {updatingId === booking._id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <XCircle size={18} />
                    )}
                    <span className="text-[10px] font-bold uppercase mt-1">
                      Reject
                    </span>
                  </button>

                  <button
                    onClick={() => handleStatusUpdate(booking._id, "completed")}
                    disabled={updatingId === booking._id || booking.status !== "accepted"}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-30 disabled:grayscale"
                  >
                    {updatingId === booking._id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <ShieldCheck size={18} />
                    )}
                    <span className="text-[10px] font-bold uppercase mt-1">
                      Done
                    </span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-mesh min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 pt-28 pb-20">
        <header className="mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 mb-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <Briefcase size={24} />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Helper Dashboard
            </h1>
          </motion.div>

          <p className="text-slate-500 font-medium max-w-2xl">
            Manage your service requests, track active bookings, and build your
            community reputation.
          </p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
            <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
            <p className="text-lg font-bold text-slate-500">
              Synchronizing database...
            </p>
          </div>
        ) : requests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-16 rounded-[3rem] text-center border-white/50"
          >
            <ShieldCheck size={64} className="text-slate-200 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              No Active Requests
            </h2>
            <p className="text-slate-500 max-w-md mx-auto">
              When citizens in your area report issues and book your services,
              they will appear here in real-time.
            </p>
          </motion.div>
        ) : (
          <>
            <div className="glass rounded-[2rem] border-white/50 p-5 mb-8 shadow-xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Total
                  </p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">
                    {stats.total}
                  </p>
                </div>

                <div className="rounded-2xl bg-amber-50 p-4 border border-amber-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Pending
                  </p>
                  <p className="text-2xl font-extrabold text-amber-700 mt-1">
                    {stats.pending}
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Accepted
                  </p>
                  <p className="text-2xl font-extrabold text-emerald-700 mt-1">
                    {stats.accepted}
                  </p>
                </div>

                <div className="rounded-2xl bg-blue-50 p-4 border border-blue-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Completed
                  </p>
                  <p className="text-2xl font-extrabold text-blue-700 mt-1">
                    {stats.completed}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {[
                  { key: "all", label: "All" },
                  { key: "pending", label: "Pending" },
                  { key: "accepted", label: "Accepted" },
                  { key: "completed", label: "Completed" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveFilter(tab.key)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all",
                      activeFilter === tab.key
                        ? "bg-slate-900 text-white shadow-lg"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <Filter size={14} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
              <div className="space-y-6">
                {leftRequests.map((booking) => (
                  <RequestCard key={booking._id} booking={booking} />
                ))}
              </div>

              <div className="space-y-6">
                {rightRequests.map((booking) => (
                  <RequestCard key={booking._id} booking={booking} />
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default HelperRequests;