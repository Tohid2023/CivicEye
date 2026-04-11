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
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const helper = location.state?.helper || null;
  const issue = location.state?.issue || null;

  const [bookingData, setBookingData] = useState({
    address: issue?.address || "",
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

      if (!helper || !issue) {
        alert("Please select an issue from My Issues before booking a helper");
        navigate("/my-issues");
        return;
      }

      const data = await createBooking({
        helperId: helper._id || helper.id,
        issueId: issue._id,
        address: bookingData.address,
        preferredDate: bookingData.date,
        preferredTime: bookingData.time,
        note: bookingData.note,
      });

      localStorage.setItem("selected_booking_id", data.booking._id);

      alert("Booking request sent successfully");
      navigate("/my-bookings");
    } catch (error) {
      alert(error.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  if (!helper || !issue) {
    return (
      <div className="bg-mesh min-h-screen">
        <Navbar />

        <main className="max-w-3xl mx-auto px-4 pt-28 pb-20">
          <div className="bg-white rounded-3xl shadow-xl p-10 text-center">
            <h1 className="text-3xl font-bold text-slate-900">
              No Issue Selected
            </h1>
            <p className="mt-3 text-slate-600">
              Please go to <strong>My Issues</strong>, choose an issue, and then
              click <strong>Find Helpers</strong>.
            </p>

            <button
              onClick={() => navigate("/my-issues")}
              className="mt-6 rounded-2xl bg-blue-600 text-white px-6 py-3 font-semibold"
            >
              Go to My Issues
            </button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-mesh min-h-screen">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-[3rem] overflow-hidden shadow-2xl border-white/50"
        >
          <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-10 text-white relative overflow-hidden text-center md:text-left">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold uppercase tracking-widest mb-4">
                <CheckCircle2 size={14} />
                <span>Final Step</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight mb-2">
                Confirm Booking
              </h1>
              <p className="text-blue-50 font-medium opacity-90">
                Send your service request to {helper.fullName}
              </p>
            </div>

            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          </div>

          <div className="p-8 md:p-12">
            <div className="grid md:grid-cols-12 gap-12">
              <div className="md:col-span-12 lg:col-span-4 space-y-6">
                <div className="glass-dark p-8 rounded-[2rem] text-white space-y-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center mb-4">
                      <User size={40} />
                    </div>
                    <h3 className="text-2xl font-bold">{helper.fullName}</h3>
                    <p className="text-blue-200 text-sm font-medium uppercase tracking-wider">
                      {helper.category}
                    </p>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 text-xs font-bold uppercase">
                        Base Charge
                      </span>
                      <span className="text-xl font-extrabold">
                        ₹{helper.serviceCharge}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-300 uppercase text-[10px] font-bold">
                        Community Rating
                      </span>
                      <p className="text-sm text-yellow-500">
                        ⭐ {helper.averageRating ?? 0}
                      </p>
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

              <div className="md:col-span-12 lg:col-span-8">
                <form onSubmit={handleConfirmBooking} className="space-y-6">
                  <div className="group">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-2 mb-2 block tracking-widest">
                      Selected Issue
                    </label>
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4">
                      <p className="font-semibold text-slate-900 capitalize">
                        {issue.category}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {issue.description}
                      </p>
                    </div>
                  </div>

                  <div className="relative group">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-2 mb-2 block tracking-widest">
                      Service Address
                    </label>
                    <div className="relative">
                      <MapPin
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={20}
                      />
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
                      <label className="text-xs font-bold text-slate-500 uppercase ml-2 mb-2 block tracking-widest">
                        Preferred Date
                      </label>
                      <div className="relative">
                        <Calendar
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          size={20}
                        />
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
                      <label className="text-xs font-bold text-slate-500 uppercase ml-2 mb-2 block tracking-widest">
                        Arrival Time
                      </label>
                      <div className="relative">
                        <Clock
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          size={20}
                        />
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
                    <label className="text-xs font-bold text-slate-500 uppercase ml-2 mb-2 block tracking-widest">
                      Notes for Helper
                    </label>
                    <div className="relative">
                      <MessageSquare
                        className="absolute left-4 top-5 text-slate-400"
                        size={20}
                      />
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
                      {loading ? (
                        "Processing..."
                      ) : (
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
