import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  PlusCircle,
  Users,
  Star,
  ArrowRight,
  Activity,
  MapPin,
  ClipboardList,
  CalendarCheck,
} from "lucide-react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import CategoryGrid from "../components/home/CategoryGrid";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";

const Home = () => {
  const { authUser } = useAuth();

  const firstName = authUser?.fullName?.split(" ")[0] || "Citizen";

  const userLocation =
    authUser?.village ||
    authUser?.city ||
    authUser?.location?.village ||
    authUser?.location?.city ||
    "Location not added";

  const actions = [
    {
      title: "Report Problem",
      path: "/report",
      icon: PlusCircle,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "Find Helpers",
      path: "/helpers",
      icon: Users,
      color: "bg-slate-700 hover:bg-slate-600",
    },
    {
      title: "Community Ratings",
      path: "/rating",
      icon: Star,
      color: "bg-slate-700 hover:bg-slate-600",
    },
  ];

  const quickCards = [
    {
      label: "Village",
      value: userLocation,
      icon: MapPin,
      color: "text-blue-600 bg-blue-50",
      clickable: false,
    },
    {
      label: "My Issues",
      value: "Track reports",
      icon: ClipboardList,
      color: "text-amber-600 bg-amber-50",
      path: "/my-issues",
      clickable: true,
    },
    {
      label: "My Bookings",
      value: "Manage requests",
      icon: CalendarCheck,
      color: "text-emerald-600 bg-emerald-50",
      path: "/my-bookings",
      clickable: true,
    },
    {
      label: "Helpers",
      value: "Explore network",
      icon: Users,
      color: "text-purple-600 bg-purple-50",
      path: "/helpers",
      clickable: true,
    },
  ];

  return (
    <div className="bg-mesh min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 pt-28 pb-20">
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
                Hello, <span className="text-blue-400">{firstName}!</span>
              </h1>

              <p className="text-xl text-slate-300 max-w-2xl leading-relaxed mb-10">
                Welcome back to CivicEye. Your dashboard for reporting and
                managing local issues in your community.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                {actions.map((action, idx) => (
                  <Link
                    key={idx}
                    to={action.path}
                    className={cn(
                      "flex items-center justify-between p-5 rounded-2xl transition-all duration-300 group hover:scale-[1.02]",
                      action.color
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <action.icon size={24} className="text-white" />
                      <span className="font-bold">{action.title}</span>
                    </div>

                    <ArrowRight
                      size={18}
                      className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                    />
                  </Link>
                ))}
              </div>
            </div>

            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/30 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/20 rounded-full blur-[80px] -ml-32 -mb-32"></div>
          </motion.div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {quickCards.map((card, idx) =>
            card.clickable ? (
              <Link
                key={idx}
                to={card.path}
                className="glass p-6 rounded-3xl border border-white/50 text-center sm:text-left hover:shadow-lg hover:-translate-y-1 transition block"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
                    card.color
                  )}
                >
                  <card.icon size={18} />
                </div>

                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                  {card.label}
                </p>
                <p className="text-xl font-extrabold text-slate-900">
                  {card.value}
                </p>
              </Link>
            ) : (
              <div
                key={idx}
                className="glass p-6 rounded-3xl border border-white/50 text-center sm:text-left"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
                    card.color
                  )}
                >
                  <card.icon size={18} />
                </div>

                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                  {card.label}
                </p>
                <p className="text-xl font-extrabold text-slate-900 break-words">
                  {card.value}
                </p>
              </div>
            )
          )}
        </section>

        <section className="mt-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Report an Issue
              </h2>
              <p className="text-slate-500 font-medium mt-1">
                Select a category below to get started
              </p>
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