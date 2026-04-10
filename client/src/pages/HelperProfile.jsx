import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { getMyHelperProfile } from "../services/helperService";
import { motion } from "framer-motion";
import { 
  User, 
  MapPin, 
  Phone, 
  IndianRupee, 
  Star, 
  MessageSquare, 
  Award, 
  ShieldCheck, 
  CheckCircle2,
  CalendarCheck,
  Zap,
  Droplet,
  Road,
  Trash2,
  Hammer,
  MoreHorizontal,
  Loader2,
  ArrowRight
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

const HelperProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const authUser = JSON.parse(localStorage.getItem("civiceye_user")) || null;

  const [helper, setHelper] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);

  useEffect(() => {
    const fetchOwnHelperProfile = async () => {
      try {
        if (location.state) {
          setHelper(location.state);
          setLoading(false);
          return;
        }

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
      <div className="bg-mesh min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <Loader2 size={64} className="animate-spin text-blue-600 mb-4" />
          <p className="text-xl font-bold text-slate-500">Retrieving profile...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!helper) {
    return (
      <div className="bg-mesh min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="glass p-12 rounded-[3.5rem] text-center max-w-lg shadow-2xl border-white/50">
            <User size={64} className="text-slate-300 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Profile Not Found</h1>
            <p className="text-slate-500 mb-8">We couldn't find the requested helper profile. It might have been removed or deactivated.</p>
            <button onClick={() => navigate(-1)} className="btn-primary">Go Back</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const categoryLabel = helper.category || "Service Professional";
  const Icon = categoryIcons[helper.category?.toLowerCase()] || MoreHorizontal;
  const isAvailable = helper.availability === "available";

  return (
    <div className="bg-mesh min-h-screen">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 pt-28 pb-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-[3.5rem] overflow-hidden shadow-2xl border-white/50"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-900 p-8 md:p-12 text-white relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="w-32 h-32 rounded-3xl bg-blue-600 border-4 border-white/10 flex items-center justify-center text-white shadow-2xl relative">
                <User size={64} />
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-xl border-4 border-slate-900">
                  <ShieldCheck size={20} fill="white" className="text-emerald-500" />
                </div>
              </div>

              <div className="text-center md:text-left flex-1">
                <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{helper.fullName}</h1>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                    isAvailable ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-red-500/20 border-red-500/30 text-red-400"
                  )}>
                    {isAvailable ? "Available Now" : "Busy Portfolio"}
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-blue-200 font-medium">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full">
                    <Icon size={16} />
                    <span>{categoryLabel}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full">
                    <MapPin size={16} />
                    <span>{helper.village || "Local Area"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -ml-32 -mb-32"></div>
          </div>

          <div className="p-8 md:p-12">
            <div className="grid md:grid-cols-12 gap-12">
              {/* Detailed Stats Column */}
              <div className="md:col-span-12 lg:col-span-7 space-y-10">
                <section>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Award size={18} className="text-blue-600" />
                    Service Profile
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Price Estimate", value: `₹${helper.serviceCharge ?? '250'}`, icon: IndianRupee, color: "text-emerald-600 bg-emerald-50" },
                      { label: "Success Rate", value: "98%", icon: CheckCircle2, color: "text-blue-600 bg-blue-50" },
                      { label: "Distance", value: helper.distance ? `${helper.distance} km away` : "Nearby", icon: MapPin, color: "text-amber-600 bg-amber-50" },
                      { label: "Experience", value: "Verified User", icon: ShieldCheck, color: "text-purple-600 bg-purple-50" },
                    ].map((stat, idx) => (
                      <div key={idx} className="p-5 bg-white/50 border border-white/60 rounded-3xl group hover:shadow-lg transition-all duration-300">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", stat.color)}>
                          <stat.icon size={20} />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{stat.label}</p>
                        <p className="text-xl font-extrabold text-slate-900">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Areas of Expertise</h3>
                  <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-[2rem] text-slate-700 leading-relaxed font-medium">
                    {helper.expertise || "Expertise details not yet provided by the helper. Based on category: Professional electrical work, wiring, and fan repairs."}
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Community Verification</h3>
                    <div className="flex items-center gap-1.5 text-blue-600 font-bold text-sm">
                      <Star size={16} fill="currentColor" className="text-amber-500" />
                      {helper.averageRating || "5.0"} • {helper.totalReviews || "12"} Reviews
                    </div>
                  </div>
                  <div className="glass p-6 rounded-[2rem] border-white/40 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <MessageSquare size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill={s <= 5 ? "#f59e0b" : "none"} className="text-amber-500" />)}
                        </div>
                        <p className="text-slate-700 font-medium italic mb-2">
                          "Extremely professional and knowledgeable. Solved my complex wiring issue in less than an hour at a very fair price."
                        </p>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Community Member • 2 Days Ago</div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Action Sidebar Column */}
              <div className="md:col-span-12 lg:col-span-5 relative">
                <div className="sticky top-28 space-y-6">
                  <div className="glass-dark p-8 rounded-[2.5rem] text-white shadow-2xl overflow-hidden relative group">
                    <h4 className="text-xl font-bold mb-6">Quick Contact</h4>
                    <div className="space-y-4 relative z-10">
                      <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-3">
                          <Phone className="text-blue-400" size={20} />
                          <span className="font-bold">{helper.phone || "98XXX XXXXX"}</span>
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Primary</div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-3">
                          <MapPin className="text-blue-400" size={20} />
                          <span className="font-bold">{helper.village || "Zirakpur"}</span>
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Village</div>
                      </div>
                    </div>
                    
                    {/* Background decorations */}
                    <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                  </div>

                  {authUser?.role !== "helper" && (
                    <div className="space-y-4">
                      <button className="w-full flex items-center justify-center gap-3 py-5 rounded-[2rem] border-2 border-slate-900 text-slate-900 text-xl font-bold hover:bg-slate-900 hover:text-white transition-all duration-300">
                        Contact Now
                        <Phone size={24} />
                      </button>

                      <button
                        onClick={handleBook}
                        className="w-full flex items-center justify-center gap-3 py-5 rounded-[2rem] bg-blue-600 text-white text-xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all hover:scale-[1.02]"
                      >
                        Book This Helper
                        <CalendarCheck size={24} />
                      </button>
                      <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest px-8">
                        Secure community payments with verified professionals
                      </p>
                    </div>
                  )}
                  
                  {authUser?.role === "helper" && helper._id === authUser._id && (
                    <button 
                      onClick={() => navigate('/helper-profile/edit')}
                      className="w-full btn-primary py-5 rounded-[2rem] flex items-center justify-center gap-3"
                    >
                      Edit Public Profile
                      <ArrowRight size={24} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default HelperProfile;