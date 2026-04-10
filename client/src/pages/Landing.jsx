import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Zap, 
  Droplet, 
  Key, 
  Trash2, 
  ArrowRight, 
  Clock, 
  Shield 
} from "lucide-react";
import Navbar from "../components/common/Navbar.jsx";
import Footer from "../components/common/Footer.jsx";
import { cn } from "../lib/utils";

const Landing = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const services = [
    { title: "Electricity", icon: Zap, color: "bg-yellow-500", lightColor: "bg-yellow-50" },
    { title: "Plumbing", icon: Droplet, color: "bg-sky-500", lightColor: "bg-sky-50" },
    { title: "Road Issues", icon: Key, color: "bg-orange-500", lightColor: "bg-orange-50" },
    { title: "Cleaning", icon: Trash2, color: "bg-green-500", lightColor: "bg-green-50" },
  ];

  return (
    <div className="bg-mesh min-h-screen">
      <Navbar />

      <main className="pt-24">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 py-20 lg:py-32">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid lg:grid-cols-2 gap-16 items-center"
          >
            <div>
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold mb-6">
                <Shield size={16} />
                <span>Trusted by Local Communities</span>
              </motion.div>
              
              <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                Your Community, <br/>
                <span className="text-blue-600">Perfectly Managed.</span>
              </motion.h1>
              
              <motion.p variants={itemVariants} className="mt-8 text-xl text-slate-600 leading-relaxed max-w-xl">
                Reporting and resolving local issues has never been easier. Connect with verified helpers and make your neighborhood better today.
              </motion.p>

              <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link to="/login" className="btn-primary flex items-center justify-center gap-2">
                  Get Started Now
                  <ArrowRight size={20} />
                </Link>
                <Link to="/register" className="bg-white hover:bg-slate-50 text-slate-900 font-semibold py-3 px-8 rounded-xl border border-slate-200 transition-all flex items-center justify-center">
                  Register as Helper
                </Link>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-12 flex items-center gap-8 grayscale opacity-70">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-slate-900">500+</span>
                  <span className="text-sm text-slate-500">Verified Helpers</span>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-slate-900">10k+</span>
                  <span className="text-sm text-slate-500">Solved Issues</span>
                </div>
              </motion.div>
            </div>

            <motion.div 
              variants={itemVariants}
              className="relative"
            >
              <div className="absolute -inset-4 bg-blue-400/20 blur-3xl rounded-full"></div>
              <div className="relative glass p-8 rounded-[2.5rem] shadow-2xl border-white/40">
                <div className="grid grid-cols-2 gap-6">
                  {services.map((service, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.05, translateY: -5 }}
                      className={cn(
                        "p-8 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all duration-300",
                        service.lightColor
                      )}
                    >
                      <div className={cn("p-4 rounded-2xl text-white shadow-lg", service.color)}>
                        <service.icon size={32} />
                      </div>
                      <span className="font-bold text-slate-900">{service.title}</span>
                    </motion.div>
                  ))}
                </div>
                
                {/* Floating Status Card */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-6 -right-6 glass p-5 rounded-2xl shadow-xl flex items-center gap-4"
                >
                  <div className="bg-green-100 p-2 rounded-full">
                    <Clock className="text-green-600" size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Issue Resolved</p>
                    <p className="text-sm font-bold text-slate-900">Plumbing fixed in 2h</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-white/50 backdrop-blur-sm py-24 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">Why the community trusts CivicEye</h2>
              <p className="mt-4 text-slate-600">Built for speed, transparency, and local empowerment.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Verified Help", desc: "Every helper goes through a background check before joining.", icon: Shield },
                { title: "Real-time Tracking", desc: "Monitor your issue status from reporting to resolution.", icon: Clock },
                { title: "Transparent Pricing", desc: "Fair and upfront pricing for every local service.", icon: Droplet },
              ].map((feature, idx) => (
                <div key={idx} className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm card-hover">
                  <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                    <feature.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Landing;