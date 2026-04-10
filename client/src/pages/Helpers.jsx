import React, { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import HelperList from "../components/helper/HelperList";
import { getAllHelpers } from "../services/helperService";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  MapPin, 
  Search, 
  Filter, 
  Maximize, 
  Minimize,
  Sparkles,
  Zap,
  Droplet,
  Road,
  Trash2,
  Hammer,
  MoreHorizontal,
  Loader2
} from "lucide-react";
import { cn } from "../lib/utils";

const categoryIcons = {
  electrician: Zap,
  plumber: Droplet,
  "road-worker": Road,
  cleaner: Trash2,
  technician: Hammer,
  other: MoreHorizontal,
};

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
      const params = { availability: "available" };
      if (selectedCategory) params.category = selectedCategory;
      if (userLatitude !== null && userLongitude !== null) {
        params.latitude = userLatitude;
        params.longitude = userLongitude;
        params.radius = radius;
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

  return (
    <div className="bg-mesh min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 pt-28 pb-20">
        <header className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">
              <Sparkles size={14} />
              <span>Available Help</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Nearby Helpers</h1>
            <p className="mt-2 text-slate-500 font-medium max-w-2xl">
              Connect with verified local professionals. We start small at 5km and expand as needed to find the best match for you.
            </p>
          </motion.div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: "Search Radius", value: `${searchRadius} km`, icon: MapPin, color: "text-blue-600 bg-blue-50" },
              { label: "Providers Found", value: helpers.length, icon: Users, color: "text-emerald-600 bg-emerald-50" },
              { label: "Scope Type", value: searchRadius === 5 ? "Nearby" : "Expanded", icon: Search, color: "text-amber-600 bg-amber-50" },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="glass p-6 rounded-3xl border-white/50 flex items-center gap-4 shadow-lg shadow-black/5"
              >
                <div className={cn("p-4 rounded-2xl", stat.color)}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-xl font-extrabold text-slate-900">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </header>

        <section className="glass p-6 md:p-8 rounded-[2.5rem] shadow-xl border-white/50 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <Filter size={20} />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl px-12 py-4 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-bold text-slate-700"
              >
                <option value="">All Services</option>
                <option value="electrician">Electricians</option>
                <option value="plumber">Plumbers</option>
                <option value="road-worker">Road Workers</option>
                <option value="cleaner">Sanitation Experts</option>
                <option value="technician">Technicians</option>
                <option value="other">Specialists</option>
              </select>
            </div>

            <div className="md:col-span-7 grid grid-cols-2 gap-4">
              <button
                onClick={() => setSearchRadius(5)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-all",
                  searchRadius === 5 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                )}
              >
                <Minimize size={20} />
                5 km Range
              </button>
              <button
                onClick={() => setSearchRadius(10)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-all",
                  searchRadius === 10 
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                )}
              >
                <Maximize size={20} />
                Go 10 km
              </button>
            </div>
          </div>
        </section>

        <section>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
              <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
              <p className="text-xl font-bold text-slate-500">Searching for pros...</p>
            </div>
          ) : helpers.length > 0 ? (
            <HelperList helpers={helpers} />
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-12 rounded-[3rem] text-center max-w-2xl mx-auto shadow-xl"
            >
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users size={40} className="text-slate-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">No helpers found</h2>
              <p className="text-slate-500 mb-8">Try expanding your search radius to 10km or selecting a different service category.</p>
              <button 
                onClick={() => setSearchRadius(10)}
                className="btn-primary"
              >
                Try 10 km Radius
              </button>
            </motion.div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Helpers;