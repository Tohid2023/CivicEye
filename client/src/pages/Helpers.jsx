import React, { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import HelperList from "../components/helper/HelperList";
import { getAllHelpers } from "../services/helperService";
import { getMyBookings } from "../services/bookingService";
import { useLocation } from "react-router-dom";

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
        (helper) => helper.availability === "available",
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
      activeStatuses.includes(booking.status),
  );

  return (
    <>
      <Navbar />

      <section className="min-h-screen bg-slate-50 px-4 py-6 pt-28">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Nearby Helpers
            </h1>
            <p className="mt-2 text-slate-600">
              Connect with verified local professionals.
            </p>

            {!selectedIssue && (
              <div className="mt-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 font-semibold">
                Select an issue from My Issues to book a helper.
              </div>
            )}

            {selectedIssue && activeBookingForIssue && (
              <div className="mt-4 rounded-2xl bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 font-semibold">
                A helper is already assigned or requested for this issue.
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-2xl p-4">
                <p className="text-sm text-slate-600">Search Radius</p>
                <p className="text-xl font-bold text-blue-700">
                  {searchRadius} km
                </p>
              </div>

              <div className="bg-green-50 rounded-2xl p-4">
                <p className="text-sm text-slate-600">Providers Found</p>
                <p className="text-xl font-bold text-green-700">
                  {helpers.length}
                </p>
              </div>

              <div className="bg-yellow-50 rounded-2xl p-4">
                <p className="text-sm text-slate-600">Scope Type</p>
                <p className="text-xl font-bold text-yellow-700">
                  {searchRadius === 5 ? "Nearby" : "Expanded"}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-4"
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
                className="rounded-2xl bg-blue-600 text-white py-4 font-semibold"
              >
                Near me
              </button>

              <button
                onClick={() => setSearchRadius(10)}
                className="rounded-2xl border border-slate-300 bg-white text-slate-700 py-4 font-semibold"
              >
                Expand area
              </button>
            </div>
          </div>

          <div className="mt-8">
            {loading ? (
              <div className="bg-white rounded-3xl p-6 text-center shadow-sm">
                Loading helpers...
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
              <div className="bg-white rounded-3xl p-6 text-center shadow-sm">
                <p className="text-lg font-semibold text-slate-800">
                  No helpers found
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
