import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { getMyIssues } from "../services/issueService";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ClipboardList, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  RefreshCcw, 
  Search,
  ArrowRight,
  ImageIcon,
  Loader2,
  Activity
} from "lucide-react";
import { cn } from "../lib/utils";

const statusConfig = {
  pending: { color: "text-amber-600 bg-amber-50 border-amber-100", icon: Clock },
  matched: { color: "text-blue-600 bg-blue-50 border-blue-100", icon: Search },
  booked: { color: "text-purple-600 bg-purple-50 border-purple-100", icon: ClipboardList },
  "in-progress": { color: "text-indigo-600 bg-indigo-50 border-indigo-100", icon: Activity },
  completed: { color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: CheckCircle2 },
  cancelled: { color: "text-red-600 bg-red-50 border-red-100", icon: AlertCircle },
  default: { color: "text-slate-600 bg-slate-50 border-slate-100", icon: AlertCircle },
};

const MyIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const data = await getMyIssues();
      setIssues(data.issues || []);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to fetch your issues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleFindHelpers = (issue) => {
    localStorage.setItem("selected_issue_id", issue._id);
    navigate("/helpers");
  };

  return (
    <div className="bg-mesh min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 pt-28 pb-20">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">
              <ClipboardList size={14} />
              <span>History</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">My Issues</h1>
            <p className="mt-2 text-slate-500 font-medium">Track and manage your community reports</p>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchIssues}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold shadow-sm hover:bg-slate-50 transition-all"
          >
            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
            Refresh List
          </motion.button>
        </header>

        {loading && issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
            <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
            <p className="text-xl font-bold text-slate-500">Loading your issues...</p>
          </div>
        ) : issues.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-12 rounded-[3rem] text-center max-w-2xl mx-auto shadow-xl"
          >
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ClipboardList size={40} className="text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No issues found</h2>
            <p className="text-slate-500 mb-8">You haven't reported any issues yet. Your contributions help make the community better!</p>
            <button 
              onClick={() => navigate("/report")}
              className="btn-primary"
            >
              Report Your First Issue
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {issues.map((issue, idx) => {
              const status = statusConfig[issue.status] || statusConfig.default;
              return (
                <motion.div
                  key={issue._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass p-6 md:p-8 rounded-[2.5rem] shadow-xl border-white/50 relative overflow-hidden group"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-bold text-slate-900 capitalize leading-none">
                        {issue.category}
                      </h3>
                      <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                        <MapPin size={14} className="text-blue-500" />
                        <span className="text-sm truncate max-w-[200px]">{issue.address || "Area location"}</span>
                      </div>
                    </div>

                    <div className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider",
                      status.color
                    )}>
                      <status.icon size={14} />
                      {issue.status}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-white/40 rounded-2xl border border-white/60">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Description</p>
                      <p className="text-slate-700 text-sm leading-relaxed font-medium line-clamp-2">
                        {issue.description}
                      </p>
                    </div>

                    {issue.image && (
                      <div className="relative group/img rounded-2xl overflow-hidden aspect-video border border-white/60">
                        <img
                          src={`http://localhost:8080${issue.image}`}
                          alt="Issue"
                          className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                          <ImageIcon className="text-white" size={32} />
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-white/40 rounded-2xl border border-white/60 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned Helper</p>
                        <p className="text-sm font-bold text-slate-800">
                          {issue.assignedHelper ? issue.assignedHelper.fullName : "Not Assigned Yet"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button
                      onClick={() => handleFindHelpers(issue)}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all hover:scale-[1.02]"
                    >
                      Find Helpers
                      <ArrowRight size={18} />
                    </button>
                  </div>
                  
                  {/* Background decoration */}
                  <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-blue-100/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyIssues;