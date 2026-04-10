import React, { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { createRating } from "../services/ratingService";
import { getMyBookings } from "../services/bookingService";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Star, 
  MessageSquare, 
  CheckCircle2, 
  User, 
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  History,
  Loader2
} from "lucide-react";
import { cn } from "../lib/utils";

const Rating = () => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [review, setReview] = useState("");
  const [bookings, setBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const fetchCompletedBookings = async () => {
    try {
      setLoading(true);
      const data = await getMyBookings();
      const completedBookings = (data.bookings || []).filter(
        (booking) => booking.status === "completed"
      );
      setBookings(completedBookings);
      if (completedBookings.length > 0) {
        setSelectedBookingId(completedBookings[0]._id);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to fetch completed bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedBookings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBookingId) return alert("No completed booking available for rating");
    if (selectedRating === 0) return alert("Please select a rating");

    try {
      setSubmitting(true);
      await createRating({
        bookingId: selectedBookingId,
        stars: selectedRating,
        review,
      });
      alert("Thank you for your feedback!");
      setSelectedRating(0);
      setReview("");
      await fetchCompletedBookings();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-mesh min-h-screen">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-28 pb-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-8 md:p-12 rounded-[3.5rem] shadow-2xl border-white/50"
        >
          <div className="text-center mb-12">
            <motion.div 
              initial={{ rotate: -10, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              className="w-24 h-24 bg-amber-500 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-amber-200"
            >
              <Star size={48} fill="white" />
            </motion.div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Rate the Service</h1>
            <p className="mt-3 text-slate-500 font-medium max-w-lg mx-auto">
              Your feedback helps us maintain the highest quality of service in our community.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 grayscale opacity-50">
              <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
              <p className="text-lg font-bold text-slate-500">Checking your history...</p>
            </div>
          ) : bookings.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-10 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-center"
            >
              <ShieldCheck className="mx-auto text-slate-200 mb-4" size={64} />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">No Service to Rate Yet</h2>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">Rating is only available for services marked as "Completed" by verified helpers.</p>
              <button 
                onClick={() => window.location.href = '/my-issues'}
                className="btn-secondary"
              >
                View My History
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="relative group">
                <label className="text-sm font-bold text-slate-700 ml-1 mb-3 block tracking-wide uppercase">Select Completed Session</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <History size={20} />
                  </div>
                  <select
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-12 py-5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-bold text-slate-700 shadow-sm"
                  >
                    {bookings.map((booking) => (
                      <option key={booking._id} value={booking._id}>
                        {booking.helper?.fullName || "Helper"} • {booking.issue?.category?.toUpperCase()} • {new Date(booking.createdAt).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <label className="text-sm font-bold text-slate-700 mb-6 tracking-wide uppercase">Rate Your Experience</label>
                <div className="flex items-center gap-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setSelectedRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        size={56}
                        strokeWidth={1.5}
                        className={cn(
                          "transition-all duration-300 drop-shadow-md",
                          (hoverRating || selectedRating) >= star
                            ? "text-amber-500 fill-amber-500 scale-110"
                            : "text-slate-200 grayscale"
                        )}
                      />
                    </motion.button>
                  ))}
                </div>
                <div className="mt-4 h-6">
                  <AnimatePresence mode="wait">
                    {(hoverRating || selectedRating) > 0 && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-amber-600 font-bold tracking-widest uppercase text-xs"
                      >
                        {["Poor", "Fair", "Good", "Great", "Excellent"][(hoverRating || selectedRating) - 1]}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="relative group">
                <label className="text-sm font-bold text-slate-700 ml-1 mb-3 block tracking-wide uppercase">Share Your Thoughts</label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Tell us about the service quality, professional behavior, and timeliness..."
                    className="w-full bg-white border border-slate-200 rounded-3xl px-12 py-5 h-44 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium resize-none shadow-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-3 py-6 rounded-[2.5rem] bg-slate-900 text-white text-xl font-bold shadow-2xl hover:bg-slate-800 transition-all hover:scale-[1.01] disabled:opacity-50"
              >
                {submitting ? "Sharing Feedback..." : (
                  <>
                    Submit Community Review
                    <Sparkles size={24} />
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Rating;