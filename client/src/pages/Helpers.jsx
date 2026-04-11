import React, { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import HelperList from "../components/helper/HelperList";
import { getAllHelpers } from "../services/helperService";
import { getMyBookings } from "../services/bookingService";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Users,
  Compass,
  Loader2,
  Sparkles,
  MapPin,
  ShieldCheck,
} from "lucide-react";

const Helpers = () => {
  const [searchRadius, setSearchRadius] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [helpers, setHelpers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const selectedIssue = location.state?.issue || null;

  const currentUser = JSON.parse(localStorage.getItem("civiceye_user")) || {};

  const userLatitude = currentUser?.location?.latitude ?? null;
  const userLongitude = currentUser?.location?.longitude ?? null;

  const fetchHelpers = async (radius) => {
    try {
      setLoading(true);

      const params = {};

      if (selectedCategory) {
        params.category = selectedCategory;
      }

      if (userLatitude !== null && userLongitude !== null) {
        params.latitude = userLatitude;
        params.longitude = userLongitude;
        params.radius = radius;
      }

      const [helpersData, bookingsData] = await Promise.all([
        getAllHelpers(params),
        getMyBookings(),
      ]);

      const availableHelpers = (helpersData.helpers || []).filter(
        (helper) => helper.availability === "available"
      );

      setHelpers(availableHelpers);
      setBookings(bookingsData.bookings || []);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to fetch helpers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHelpers(searchRadius);
  }, [searchRadius, selectedCategory]);

  const activeStatuses = ["pending", "accepted", "in-progress", "booked"];

  const activeBookingForIssue = bookings.find(
    (booking) =>
      booking.issue?._id === selectedIssue?._id &&
      activeStatuses.includes(booking.status)
  );

  return (
    <>
      <Navbar />

      <section className="min-h-screen bg-mesh px-4 py-5 pt-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white/60 p-5 md:p-6"
          >
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-blue-700 border border-blue-100 mb-4">
                  <ShieldCheck size={13} />
                  Trusted Local Network
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Nearby Helpers
                </h1>

                <p className="mt-2 text-slate-500 font-medium leading-relaxed max-w-2xl">
                  Connect with verified local professionals and choose the right
                  helper for your issue based on distance, rating, and
                  availability.
                </p>
              </div>

              <div className="rounded-[1.4rem] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white px-5 py-4 shadow-lg shadow-blue-100 min-w-[220px]">
                <div className="flex items-center gap-2 text-blue-100 text-[11px] font-bold uppercase tracking-widest">
                  <Sparkles size={13} />
                  Live Availability
                </div>
                <p className="mt-2 text-3xl font-extrabold">{helpers.length}</p>
                <p className="text-sm text-blue-100 mt-1">
                  helpers ready in your visible range
                </p>
              </div>
            </div>

            {!selectedIssue && (
              <div className="mt-5 rounded-[1.2rem] bg-blue-50 border border-blue-100 text-blue-700 px-4 py-3 font-semibold flex items-center gap-3 text-sm">
                <MapPin size={17} />
                Select an issue from My Issues to book a helper.
              </div>
            )}

            {selectedIssue && activeBookingForIssue && (
              <div className="mt-5 rounded-[1.2rem] bg-amber-50 border border-amber-100 text-amber-800 px-4 py-3 font-semibold flex items-center gap-3 text-sm">
                <Users size={17} />
                A helper is already assigned or requested for this issue.
              </div>
            )}

            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-[1.2rem] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <Search size={15} />
                  <p className="text-sm font-semibold">Search Radius</p>
                </div>
                <p className="mt-2 text-2xl font-extrabold text-blue-700">
                  {searchRadius} km
                </p>
              </div>

              <div className="rounded-[1.2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <Users size={15} />
                  <p className="text-sm font-semibold">Providers Found</p>
                </div>
                <p className="mt-2 text-2xl font-extrabold text-emerald-700">
                  {helpers.length}
                </p>
              </div>

              <div className="rounded-[1.2rem] border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <Compass size={15} />
                  <p className="text-sm font-semibold">Scope Type</p>
                </div>
                <p className="mt-2 text-2xl font-extrabold text-amber-700">
                  {searchRadius === 5 ? "Nearby" : "Expanded"}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-[1.1rem] border border-slate-200 bg-white px-4 py-3.5 font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Services</option>
                <option value="electrician">Electrician</option>
                <option value="plumber">Plumber</option>
                <option value="road-worker">Road Worker</option>
                <option value="cleaner">Cleaner</option>
                <option value="technician">Technician</option>
                <option value="other">Other</option>
              </select>

              <button
                onClick={() => setSearchRadius(5)}
                className={`rounded-[1.1rem] py-3.5 font-bold transition-all shadow-sm ${
                  searchRadius === 5
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Near me
              </button>

              <button
                onClick={() => setSearchRadius(10)}
                className={`rounded-[1.1rem] py-3.5 font-bold transition-all shadow-sm ${
                  searchRadius === 10
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Expand area
              </button>
            </div>
          </motion.div>

          <div className="mt-6">
            {loading ? (
              <div className="bg-white/80 backdrop-blur-xl rounded-[1.8rem] p-8 text-center shadow-lg border border-white/60">
                <Loader2
                  size={38}
                  className="animate-spin text-blue-600 mx-auto mb-4"
                />
                <p className="text-base font-bold text-slate-700">
                  Finding nearby helpers...
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  We are searching the best available professionals for you.
                </p>
              </div>
            ) : helpers.length > 0 ? (
              <HelperList
                helpers={helpers}
                bookings={bookings}
                selectedIssue={selectedIssue}
                activeBookingForIssue={activeBookingForIssue}
                allowBooking={!!selectedIssue}
              />
            ) : (
              <div className="bg-white/80 backdrop-blur-xl rounded-[1.8rem] p-8 text-center shadow-lg border border-white/60">
                <Users size={38} className="text-slate-300 mx-auto mb-4" />
                <p className="text-xl font-bold text-slate-900">
                  No helpers found
                </p>
                <p className="text-slate-500 mt-2">
                  Try changing the category or expanding the search area.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Helpers;