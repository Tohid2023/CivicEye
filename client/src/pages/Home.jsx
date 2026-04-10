import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  PlusCircle, 
  Users, 
  Star, 
  ArrowRight,
  ShieldCheck,
  Activity
} from "lucide-react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import CategoryGrid from "../components/home/CategoryGrid";
import { getMyBookings } from "../services/bookingService";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";

const Home = () => {
  const { authUser } = useAuth();
  const [activeBooking, setActiveBooking] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(true);

  useEffect(() => {
    const fetchActiveBooking = async () => {
      try {
        const data = await getMyBookings();
        // Find if there's any pending or accepted booking
        const pendingOrAccepted = data.bookings?.find(b => b.status === 'pending' || b.status === 'accepted');
        setActiveBooking(pendingOrAccepted || null);
      } catch (error) {
        console.error("Failed to fetch bookings", error);
      } finally {
        setBookingLoading(false);
      }
    };

    fetchActiveBooking();
  }, []);

  return (
    <div className="bg-mesh min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 pt-28 pb-20">
        {/* Welcome Section */}
        <section className="mb-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-dark p-10 rounded-[3rem] text-white relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-widest mb-6">
                <Activity size={14} />
                <span>Community Dashboard</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
                Hello, <span className="text-blue-400">{authUser?.fullName?.split(' ')[0] || "Citizen"}!</span>
              </h1>
              <p className="text-xl text-slate-300 max-w-2xl leading-relaxed mb-10">
                Welcome back to CivicEye. Your dashboard for reporting and managing local issues in your community.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { title: "Report Problem", path: "/report", icon: PlusCircle, color: "bg-blue-600 hover:bg-blue-700", show: true },
                  { 
                    title: activeBooking 
                      ? activeBooking.status === "pending" 
                        ? "Request Sent ⏳" 
                        : "Request Accepted ✅" 
                      : "Find Helpers", 
                    path: activeBooking ? (activeBooking.status === "accepted" ? "/helper-profile" : "#") : "/helpers", 
                    icon: Users, 
                    color: activeBooking ? "bg-emerald-600/80 cursor-default" : "bg-slate-700 hover:bg-slate-600",
                    state: activeBooking?.helper,
                    show: true,
                    disabled: activeBooking?.status === "pending"
                  },
                  { title: "Community Ratings", path: "/rating", icon: Star, color: "bg-slate-700 hover:bg-slate-600", show: true },
                ].filter(a => a.show).map((action, idx) => (
                  <Link 
                    key={idx} 
                    to={action.path}
                    state={action.state}
                    onClick={(e) => action.disabled && e.preventDefault()}
                    className={cn(
                      "flex items-center justify-between p-5 rounded-2xl transition-all duration-300 group",
                      action.color,
                      action.disabled && "opacity-80 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <action.icon size={24} className="text-white" />
                      <div className="flex flex-col">
                        <span className="font-bold">{action.title}</span>
                        {activeBooking && action.title.includes("Accepted") && (
                          <span className="text-[10px] opacity-80 uppercase tracking-tighter">View {activeBooking.helper?.fullName}</span>
                        )}
                      </div>
                    </div>
                    {!action.disabled && <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
                  </Link>
                ))}
              </div>
            </div>

            {/* Decorative background gradients */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/30 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/20 rounded-full blur-[80px] -ml-32 -mb-32"></div>
          </motion.div>
        </section>

        {/* Stats / Quick Info */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { label: "Village", value: authUser?.village || "Not Set", icon: ShieldCheck },
            { label: "Active Issues", value: "3", icon: Activity },
            { label: "Solved This Week", value: "12", icon: ShieldCheck },
            { label: "Verified Helpers", value: "48", icon: Users },
          ].map((stat, idx) => (
            <div key={idx} className="glass p-6 rounded-3xl border border-white/50 text-center sm:text-left">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-xl font-extrabold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </section>

        {/* Categories Section */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Report an Issue</h2>
              <p className="text-slate-500 font-medium mt-1">Select a category below to get started</p>
            </div>
          </div>
          
          <CategoryGrid />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;