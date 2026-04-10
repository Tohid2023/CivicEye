import React, { useEffect, useState } from "react";
import { getAdminDashboard } from "../../services/adminService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Briefcase, 
  AlertTriangle, 
  CalendarCheck, 
  Star, 
  LogOut, 
  ArrowUpRight, 
  ShieldCheck, 
  Activity,
  ChevronRight,
  TrendingUp,
  MapPin,
  Clock,
  Loader2
} from "lucide-react";
import { cn } from "../../lib/utils";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHelpers: 0,
    totalIssues: 0,
    totalBookings: 0,
    totalRatings: 0,
  });

  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const [recentIssues, setRecentIssues] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await getAdminDashboard();
      setStats(data.stats || {});
      setRecentIssues(data.recentIssues || []);
      setRecentBookings(data.recentBookings || []);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const statCards = [
    { title: "Total Users", value: stats.totalUsers || 0, icon: Users, color: "text-blue-600 bg-blue-50 border-blue-100", trend: "+12%" },
    { title: "Total Helpers", value: stats.totalHelpers || 0, icon: Briefcase, color: "text-emerald-600 bg-emerald-50 border-emerald-100", trend: "+5%" },
    { title: "Reported Issues", value: stats.totalIssues || 0, icon: AlertTriangle, color: "text-amber-600 bg-amber-50 border-amber-100", trend: "-2%" },
    { title: "Total Bookings", value: stats.totalBookings || 0, icon: CalendarCheck, color: "text-purple-600 bg-purple-50 border-purple-100", trend: "+18%" },
    { title: "Total Ratings", value: stats.totalRatings || 0, icon: Star, color: "text-pink-600 bg-pink-50 border-pink-100", trend: "+24%" },
  ];

  if (loading) {
    return (
      <div className="bg-mesh min-h-screen flex flex-col items-center justify-center pt-24 pb-12">
        <Loader2 size={64} className="animate-spin text-blue-600 mb-6" />
        <p className="text-xl font-bold text-slate-500 uppercase tracking-widest">Compiling Analytics...</p>
      </div>
    );
  }

  return (
    <div className="bg-mesh min-h-screen">
      {/* Admin Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto glass p-4 rounded-[2rem] flex items-center justify-between border-white/50 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 leading-tight">CivicEye</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin Control Center</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-600 hover:text-white transition-all shadow-sm"
          >
            <LogOut size={16} />
            Terminte Session
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-[0.2em] mb-2">
              <Activity size={14} />
              Platform Overview
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Executive Dashboard</h1>
          </motion.div>
          <div className="flex items-center gap-4">
            <div className="px-5 py-3 glass rounded-2xl flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Health</span>
              <span className="flex items-center gap-1.5 text-emerald-500 font-bold text-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                Nominal
              </span>
            </div>
            <button className="p-4 glass rounded-2xl text-slate-600 hover:text-blue-600 transition-colors">
              <TrendingUp size={24} />
            </button>
          </div>
        </header>

        {/* Dynamic Analytics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
          {statCards.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: index * 0.1 } }}
              className="glass p-6 rounded-[2.5rem] shadow-xl border-white/50 group hover:shadow-2xl transition-all duration-300"
            >
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm", item.color)}>
                <item.icon size={22} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">{item.title}</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-3xl font-extrabold text-slate-900">{item.value}</h3>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                    item.trend.startsWith('+') ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"
                  )}>
                    {item.trend}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Recent Issues Visualization */}
          <section className="lg:col-span-12 xl:col-span-7">
            <div className="glass p-8 rounded-[3rem] shadow-2xl border-white/50 h-full">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                    <AlertTriangle size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Issue Stream</h2>
                </div>
                <button className="flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-widest hover:translate-x-1 transition-transform">
                  View Repository <ArrowUpRight size={14} />
                </button>
              </div>

              <div className="space-y-5">
                {recentIssues.length === 0 ? (
                  <div className="py-20 text-center grayscale opacity-50">
                    <Loader2 size={32} className="mx-auto mb-4 animate-spin text-slate-300" />
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Synchronizing Issue Data...</p>
                  </div>
                ) : (
                  recentIssues.map((issue, idx) => (
                    <motion.div
                      key={issue._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.05 } }}
                      className="p-5 bg-white/40 border border-white/60 rounded-3xl hover:bg-white/60 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                          <Users size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                            {issue.user?.fullName || "Verified Citizen"}
                          </h4>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-full">{issue.category}</span>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                              <MapPin size={10} />
                              {issue.user?.village || "Local Area"}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden md:block text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Status</p>
                          <p className="text-xs font-extrabold text-blue-600 uppercase tracking-tighter">{issue.status}</p>
                        </div>
                        <div className="p-2 glass rounded-lg text-slate-300 group-hover:text-blue-500 transition-colors cursor-pointer">
                          <ChevronRight size={20} />
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Activity Sidebar */}
          <section className="lg:col-span-12 xl:col-span-5 space-y-10">
            <div className="glass-dark p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden h-full">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-10">
                   <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                    <Activity size={20} />
                  </div>
                  <h2 className="text-2xl font-bold">Live Activity</h2>
                </div>

                <div className="space-y-8">
                  {recentBookings.length === 0 ? (
                    <div className="py-12 text-center opacity-30">
                      <Clock size={24} className="mx-auto mb-2" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Monitoring Network Activity</p>
                    </div>
                  ) : (
                    recentBookings.map((booking, idx) => (
                      <div key={booking._id} className="relative flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                          {idx !== recentBookings.length - 1 && <div className="w-0.5 h-full bg-white/10 mt-2"></div>}
                        </div>
                        <div className="pb-8">
                          <p className="text-xs font-bold text-blue-300 uppercase tracking-[0.15em] mb-2">New Booking Confirmation</p>
                          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                            <p className="font-bold mb-1">{booking.user?.fullName || "Citizen"} Booked {booking.helper?.fullName || "Helper"}</p>
                            <p className="text-xs text-slate-400 font-medium">{booking.address}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Background gradient */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            </div>
          </section>
        </div>
        
        {/* Quick System Actions Layer */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="group p-8 glass rounded-[2.5rem] border-white/50 text-left hover:bg-blue-600 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-200">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-white transition-colors shadow-sm">
              <Users size={24} />
            </div>
            <h4 className="text-xl font-bold text-slate-900 group-hover:text-white transition-colors">Manage User Node</h4>
            <p className="text-slate-500 group-hover:text-blue-100 text-sm mt-2 transition-colors">Review and modify community citizen records</p>
          </button>
          <button className="group p-8 glass rounded-[2.5rem] border-white/50 text-left hover:bg-emerald-600 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-200">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-white transition-colors shadow-sm">
              <Briefcase size={24} />
            </div>
            <h4 className="text-xl font-bold text-slate-900 group-hover:text-white transition-colors">Helper Analytics</h4>
            <p className="text-slate-500 group-hover:text-emerald-100 text-sm mt-2 transition-colors">Analyze professional service performance</p>
          </button>
          <button className="group p-8 glass rounded-[2.5rem] border-white/50 text-left hover:bg-slate-900 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-900 mb-6 group-hover:bg-white/10 group-hover:text-white transition-colors shadow-sm">
              <ShieldCheck size={24} />
            </div>
            <h4 className="text-xl font-bold text-slate-900 group-hover:text-white transition-colors">System Logs</h4>
            <p className="text-slate-500 group-hover:text-slate-400 text-sm mt-2 transition-colors">Full transparency of all platform transactions</p>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
