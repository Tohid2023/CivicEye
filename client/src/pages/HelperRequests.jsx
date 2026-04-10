import React, { useEffect, useState } from "react";
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
  ArrowRight,
  ShieldCheck,
  Loader2,
  Star,
  IndianRupee,
  User as UserIcon
} from "lucide-react";
import { cn } from "../lib/utils";
import { getMyHelperProfile } from "../services/helperService";

const HelperRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [helperProfile, setHelperProfile] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const [bookingsData, profileData] = await Promise.all([
        getHelperBookings(),
        getMyHelperProfile()
      ]);
      setRequests(bookingsData.bookings || []);
      setHelperProfile(profileData.helper || null);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
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
        return { color: "text-amber-600 bg-amber-50 border-amber-100", icon: AlertCircle };
      case "accepted":
        return { color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: CheckCircle2 };
      case "rejected":
        return { color: "text-red-600 bg-red-50 border-red-100", icon: XCircle };
      case "completed":
        return { color: "text-blue-600 bg-blue-50 border-blue-100", icon: ShieldCheck };
      default:
        return { color: "text-slate-600 bg-slate-50 border-slate-100", icon: Clock };
    }
  };

  return (
    <div className="bg-mesh min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 pt-28 pb-20">
        <header className="mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 mb-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <Briefcase size={24} />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Helper Dashboard</h1>
          </motion.div>
          <p className="text-slate-500 font-medium max-w-2xl">
            Manage your service requests, track active bookings, and build your community reputation.
          </p>
        </header>

        {helperProfile && (
          <section className="mb-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-8 rounded-[3rem] border-white/50 flex flex-col md:flex-row items-center gap-8 shadow-xl"
            >
              <div className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                <UserIcon size={48} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-slate-900">{helperProfile.fullName}</h2>
                <p className="text-blue-600 font-bold text-sm uppercase tracking-wider mb-3">{helperProfile.category}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium bg-slate-100 px-3 py-1 rounded-full">
                    <MapPin size={14} />
                    {helperProfile.village}
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-600 text-sm font-bold bg-amber-50 px-3 py-1 rounded-full">
                    <Star size={14} fill="currentColor" />
                    {helperProfile.averageRating || "5.0"} Rating
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-bold bg-emerald-50 px-3 py-1 rounded-full">
                    <IndianRupee size={14} />
                    {helperProfile.serviceCharge} Base Fee
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest border",
                  helperProfile.availability === "available" ? "bg-emerald-500 text-white" : "bg-red-50 text-red-600 border-red-100"
                )}>
                  {helperProfile.availability === "available" ? "Accepting Jobs" : "Busy"}
                </div>
              </div>
            </motion.div>
          </section>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Service Requests</h2>
            <p className="text-slate-500 text-sm font-medium">Manage your incoming and active bookings</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
            <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
            <p className="text-lg font-bold text-slate-500">Synchronizing database...</p>
          </div>
        ) : requests.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-16 rounded-[3rem] text-center border-white/50"
          >
            <ShieldCheck size={64} className="text-slate-200 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No Active Requests</h2>
            <p className="text-slate-500 max-w-md mx-auto">When citizens in your area report issues and book your services, they will appear here in real-time.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AnimatePresence mode="popLayout">
              {requests.map((booking, idx) => {
                const status = getStatusConfig(booking.status);
                const StatusIcon = status.icon;
                
                return (
                  <motion.div
                    key={booking._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.1 } }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-dark rounded-[2.5rem] overflow-hidden border-white/10 group shadow-xl"
                  >
                    <div className="p-8">
                      <div className="flex items-start justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/10 group-hover:bg-blue-600 group-hover:border-blue-500 transition-all">
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
                          </div>
                        </div>

                        <div className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border flex items-center gap-1.5",
                          status.color
                        )}>
                          <StatusIcon size={12} />
                          {booking.status}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <div className="flex items-center gap-2 text-slate-400 mb-1">
                            <Calendar size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Date</span>
                          </div>
                          <p className="text-white font-bold">{booking.preferredDate || "Not set"}</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <div className="flex items-center gap-2 text-slate-400 mb-1">
                            <Clock size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Time</span>
                          </div>
                          <p className="text-white font-bold">{booking.preferredTime || "Not set"}</p>
                        </div>
                      </div>

                      {booking.issue?.image && (
                        <div className="mb-8 rounded-3xl overflow-hidden border border-white/10 relative h-48 group/img">
                          <img 
                            src={`http://localhost:8080${booking.issue.image}`}
                            alt="Issue Context"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                          <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-widest">
                            <ImageIcon size={14} />
                            Visual Context Attached
                          </div>
                        </div>
                      )}

                      <div className="space-y-4 mb-8">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 text-blue-400"><Phone size={18} /></div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Citizen Contact</p>
                            <p className="text-white font-bold">{booking.user?.phone || "Private Contact"}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="mt-1 text-emerald-400"><MessageSquare size={18} /></div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Observation Note</p>
                            <p className="text-white/80 text-sm italic">"{booking.note || "Proceed with standard inspection."}"</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => handleStatusUpdate(booking._id, "accepted")}
                          disabled={updatingId === booking._id || booking.status !== "pending"}
                          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-30 disabled:grayscale"
                        >
                          {updatingId === booking._id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                          <span className="text-[10px] font-bold uppercase mt-1">Accept</span>
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(booking._id, "rejected")}
                          disabled={updatingId === booking._id || booking.status !== "pending"}
                          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white transition-all disabled:opacity-30 disabled:grayscale"
                        >
                          {updatingId === booking._id ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                          <span className="text-[10px] font-bold uppercase mt-1">Reject</span>
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(booking._id, "completed")}
                          disabled={updatingId === booking._id || booking.status !== "accepted"}
                          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-30 disabled:grayscale"
                        >
                          {updatingId === booking._id ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                          <span className="text-[10px] font-bold uppercase mt-1">Done</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default HelperRequests;
