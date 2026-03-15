import React, { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import HelperList from "../components/helper/HelperList";
import { getAllHelpers } from "../services/helperService";

const Helpers = () => {
  const [searchRadius, setSearchRadius] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem("civiceye_user")) || {};

  const userLatitude = currentUser?.location?.latitude ?? null;
  const userLongitude = currentUser?.location?.longitude ?? null;

  const fetchHelpers = async (radius) => {
    try {
      setLoading(true);

      const params = {
        availability: "available",
        radius,
      };

      if (selectedCategory) {
        params.category = selectedCategory;
      }

      if (userLatitude !== null && userLongitude !== null) {
        params.latitude = userLatitude;
        params.longitude = userLongitude;
      }

      const data = await getAllHelpers(params);
      setHelpers(data.helpers || []);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to fetch helpers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHelpers(searchRadius);
  }, [searchRadius, selectedCategory]);

  const handleSearch5Km = () => {
    setSearchRadius(5);
  };

  const handleExpandSearch = () => {
    setSearchRadius(10);
  };

  return (
    <>
      <Navbar />

      <section className="min-h-screen bg-slate-50 px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Nearby Helpers
            </h1>
            <p className="mt-2 text-slate-600">
              CivicEye first searches helpers within <strong>5 km</strong>. If
              none are found, expand to <strong>10 km</strong>.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-2xl p-4">
                <p className="text-sm text-slate-600">Current Search Radius</p>
                <p className="text-xl font-bold text-blue-700">
                  {searchRadius} km
                </p>
              </div>

              <div className="bg-green-50 rounded-2xl p-4">
                <p className="text-sm text-slate-600">Helpers Found</p>
                <p className="text-xl font-bold text-green-700">
                  {helpers.length}
                </p>
              </div>

              <div className="bg-yellow-50 rounded-2xl p-4">
                <p className="text-sm text-slate-600">Search Type</p>
                <p className="text-xl font-bold text-yellow-700">
                  {searchRadius === 5 ? "Nearby First" : "Expanded Search"}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-base outline-none focus:border-blue-500"
              >
                <option value="">All Categories</option>
                <option value="electrician">Electrician</option>
                <option value="plumber">Plumber</option>
                <option value="road-worker">Road Worker</option>
                <option value="cleaner">Cleaner</option>
                <option value="technician">Technician</option>
                <option value="other">Other</option>
              </select>

              <button
                onClick={handleSearch5Km}
                className="rounded-2xl bg-blue-600 text-white py-4 font-semibold"
              >
                Search in 5 km
              </button>

              <button
                onClick={handleExpandSearch}
                className="rounded-2xl bg-green-600 text-white py-4 font-semibold"
              >
                Expand to 10 km
              </button>
            </div>
          </div>

          <div className="mt-8">
            {loading ? (
              <div className="bg-white rounded-3xl p-6 text-center shadow-sm">
                Loading helpers...
              </div>
            ) : helpers.length > 0 ? (
              <HelperList helpers={helpers} />
            ) : (
              <div className="bg-white rounded-3xl p-6 text-center shadow-sm">
                <p className="text-lg font-semibold text-slate-800">
                  No helpers found within {searchRadius} km
                </p>
                <p className="mt-2 text-slate-600">
                  Try another category or expand the search area.
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
