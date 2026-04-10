import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Star, 
  MapPin, 
  IndianRupee, 
  User, 
  Phone, 
  CalendarCheck, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Droplet,
  Road,
  Trash2,
  Hammer,
  MoreHorizontal
} from "lucide-react";
import { cn } from "../../lib/utils";

const categoryIcons = {
  electrician: Zap,
  plumber: Droplet,
  "road-worker": Road,
  cleaner: Trash2,
  technician: Hammer,
  other: MoreHorizontal,
};

const HelperCard = ({ helper }) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate("/helper-profile", { state: helper });
  };

  const handleBook = () => {
    navigate("/booking", { state: helper });
  };

  const Icon = categoryIcons[helper.category?.toLowerCase()] || MoreHorizontal;

  return (
    <motion.div
      whileHover={{ translateY: -5 }}
      className="glass p-6 rounded-[2.5rem] shadow-xl border-white/50 relative overflow-hidden group"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <User size={28} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 leading-tight">
              {helper.fullName || "Verified Helper"}
            </h3>
            <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs uppercase tracking-wider mt-1">
              <Icon size={14} />
              {helper.category || "General Service"}
            </div>
          </div>
        </div>

        <div className={cn(
          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
          helper.availability === "available" 
            ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
            : "bg-red-50 border-red-100 text-red-600"
        )}>
          {helper.availability || "Status"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="p-3 bg-white/40 rounded-2xl border border-white/60">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <MapPin size={12} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Distance</span>
          </div>
          <p className="text-lg font-extrabold text-slate-800">
            {helper.distance ? `${helper.distance}km` : "N/A"}
          </p>
        </div>

        <div className="p-3 bg-white/40 rounded-2xl border border-white/60">
          <div className="flex items-center gap-1.5 text-amber-500 mb-1">
            <Star size={12} fill="currentColor" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rating</span>
          </div>
          <p className="text-lg font-extrabold text-slate-800">
            {helper.averageRating ?? "5.0"}
          </p>
        </div>

        <div className="p-3 bg-white/40 rounded-2xl border border-white/60 col-span-2 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <IndianRupee size={12} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Standard Fee</span>
            </div>
            <p className="text-lg font-extrabold text-slate-900">
              ₹{helper.serviceCharge ?? "250"}
            </p>
          </div>
          <div className="text-emerald-500">
            <ShieldCheck size={28} />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex gap-3">
          <button
            onClick={handleViewProfile}
            className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
          >
            Profile
          </button>
          <button
            onClick={handleBook}
            className="flex-1 py-3.5 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            <CalendarCheck size={16} />
            Book Now
          </button>
        </div>
        
        <button className="w-full py-4 rounded-xl bg-blue-600 text-white font-extrabold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
          <Phone size={18} />
          Contact Specialized Help
          <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </button>
      </div>

      {/* Decorative pulse info */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors"></div>
    </motion.div>
  );
};

export default HelperCard;