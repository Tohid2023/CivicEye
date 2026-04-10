import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { createBooking } from "../services/bookingService";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  MessageSquare, 
  CheckCircle2, 
  User, 
  IndianRupee,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import { cn } from "../lib/utils";

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const helper = location.state || {
    _id: "1",
    fullName: "Community Helper",
    category: "Service Provider",
    distance: 2.5,
    averageRating: 4.8,
    serviceCharge: 250,
    availability: "available",
  };

  const [bookingData, setBookingData] = useState({
    address: "",
    date: "",
    time: "",
    note: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setBookingData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const selectedIssueId = localStorage.getItem("selected_issue_id");

      if (!selectedIssueId) {
        alert("Please report an issue first before booking a helper");
        navigate("/report");
        return;
      }

      const data = await createBooking({
        helperId: helper._id || helper.id,
        issueId: selectedIssueId,
        address: bookingData.address,
        preferredDate: bookingData.date,
        note: bookingData.note,
        preferredTime: bookingData.time,
      });

      localStorage.setItem("selected_booking_id", data.booking._id);
      navigate("/rating");
    } catch (error) {
      alert(error.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-mesh min-h-screen">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-28 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-[3rem] overflow-hidden shadow-2xl border-white/50"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-10 text-white relative overflow-hidden text-center md:text-left">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold uppercase tracking-widest mb-4">
                <CheckCircle2 size={14} />
                <span>Final Step</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight mb-2">Confirm Booking</h1>
              <p className="text-blue-50 font-medium opacity-90">Send your service request to {helper.fullName}</p>
            </div>
            
            {/* Background design */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          </div>

          <div className="p-8 md:p-12">
            <div className="grid md:grid-cols-12 gap-12">
              {/* Left Side: Helper Info Summary */}
              <div className="md:col-span-12 lg:col-span-4 space-y-6">
                <div className="glass-dark p-8 rounded-[2rem] text-white space-y-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center mb-4">
                      <User size={40} />
                    </div>
                    <h3 className="text-2xl font-bold">{helper.fullName}</h3>
                    <p className="text-blue-200 text-sm font-medium uppercase tracking-wider">{helper.category}</p>
                  </div>
                  
                  <div className="space-y-4 pt-6 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 text-xs font-bold uppercase">Base Charge</span>
                      <span className="text-xl font-extrabold">₹{helper.serviceCharge}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-300 uppercase text-[10px] font-bold">Community Rating</span>
                      <span className="font-bold">⭐ {helper.averageRating || "5.0"}</span>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-white/10 gap-2 flex flex-col">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                      <ShieldCheck size={16} />
                      Verified Provider
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Booking Form */}
              <div className="md:col-span-12 lg:col-span-8">
                <form onSubmit={handleConfirmBooking} className="space-y-6">
                  <div className="relative group">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-2 mb-2 block tracking-widest">Service Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                      <input
                        type="text"
                        name="address"
                        value={bookingData.address}
                        onChange={handleChange}
                        required
                        placeholder="Village name, road, or house location"
                        className="w-full bg-white/50 border border-slate-200 rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-2 mb-2 block tracking-widest">Preferred Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input
                          type="date"
                          name="date"
                          value={bookingData.date}
                          onChange={handleChange}
                          required
                          className="w-full bg-white/50 border border-slate-200 rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-2 mb-2 block tracking-widest">Arrival Time</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input
                          type="time"
                          name="time"
                          value={bookingData.time}
                          onChange={handleChange}
                          required
                          className="w-full bg-white/50 border border-slate-200 rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="group">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-2 mb-2 block tracking-widest">Notes for Helper</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                      <textarea
                        name="note"
                        value={bookingData.note}
                        onChange={handleChange}
                        placeholder="Add special instructions for the professional..."
                        className="w-full bg-white/50 border border-slate-200 rounded-2xl px-12 py-4 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 py-5 rounded-[2rem] bg-blue-600 text-white text-xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all hover:scale-[1.02] disabled:opacity-50"
                    >
                      {loading ? "Processing..." : (
                        <>
                          Send Booking Request
                          <ArrowRight size={24} />
                        </>
                      )}
                    </button>
                    <p className="text-center text-slate-400 text-xs mt-4 font-bold uppercase tracking-tighter">
                      The helper will be notified immediately of your request
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Booking;
