import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { getMyHelperProfile } from "../services/helperService";

const HelperProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const authUser = JSON.parse(localStorage.getItem("civiceye_user")) || null;

  const [helper, setHelper] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);

  useEffect(() => {
    const fetchOwnHelperProfile = async () => {
      try {
        // If state exists, user opened a public helper profile from helper list
        if (location.state) {
          setHelper(location.state);
          setLoading(false);
          return;
        }

        // If no state and logged-in account is helper, fetch own profile
        if (authUser?.role === "helper") {
          const data = await getMyHelperProfile();
          setHelper(data.helper);
        }
      } catch (error) {
        alert(error.response?.data?.message || "Failed to load helper profile");
      } finally {
        setLoading(false);
      }
    };

    fetchOwnHelperProfile();
  }, [location.state]);

  const handleBook = () => {
    if (!helper) return;
    navigate("/booking", { state: helper });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <section className="min-h-screen bg-slate-50 px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-8 text-center shadow-sm">
              Loading helper profile...
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  if (!helper) {
    return (
      <>
        <Navbar />
        <section className="min-h-screen bg-slate-50 px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-8 text-center shadow-sm">
              Helper profile not found.
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  const displayName = helper.fullName || "Helper";
  const displayCategory = helper.category || "Service";
  const displayVillage = helper.village || "N/A";
  const displayDistance =
    helper.distance !== null && helper.distance !== undefined
      ? `${helper.distance} km away`
      : authUser?.role === "helper"
      ? "Your service area"
      : "N/A";
  const displayPhone = helper.phone || "N/A";
  const displayCharge = helper.serviceCharge ?? 0;
  const displayRating = helper.averageRating ?? 0;
  const displayReviews = helper.totalReviews ?? 0;
  const displayExpertise = helper.expertise || "No expertise added";
  const isAvailable = helper.availability === "available";

  return (
    <>
      <Navbar />

      <section className="min-h-screen bg-slate-50 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-green-500 text-white p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl">
                    👷
                  </div>
                  <h1 className="mt-4 text-3xl sm:text-4xl font-bold">
                    {displayName}
                  </h1>
                  <p className="mt-2 text-blue-50 text-lg">{displayCategory}</p>
                </div>

                <div>
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                      isAvailable
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {isAvailable ? "Available Now" : "Currently Busy"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-slate-50 rounded-2xl p-5">
                  <p className="text-sm text-slate-500">Location</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-800">
                    {displayVillage}
                  </h3>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5">
                  <p className="text-sm text-slate-500">Distance</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-800">
                    {displayDistance}
                  </h3>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5">
                  <p className="text-sm text-slate-500">Phone Number</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-800">
                    {displayPhone}
                  </h3>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5">
                  <p className="text-sm text-slate-500">Approximate Charge</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-800">
                    ₹{displayCharge}
                  </h3>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5">
                  <p className="text-sm text-slate-500">Rating</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-800">
                    ⭐ {displayRating}
                  </h3>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5">
                  <p className="text-sm text-slate-500">Reviews</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-800">
                    {displayReviews} Reviews
                  </h3>
                </div>
              </div>

              <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-5">
                <p className="text-sm text-slate-500">Service Expertise</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-800">
                  {displayExpertise}
                </h3>
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-slate-800">
                  Recent Customer Review
                </h3>
                <p className="mt-2 text-slate-600">
                  “Helpful and quick service. Problem solved on the same day.”
                </p>
              </div>

              {authUser?.role !== "helper" && (
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button className="w-full rounded-2xl bg-blue-600 text-white py-4 text-lg font-semibold">
                    Contact Helper
                  </button>

                  <button
                    onClick={handleBook}
                    className="w-full rounded-2xl bg-green-600 text-white py-4 text-lg font-semibold"
                  >
                    Book This Helper
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default HelperProfile;