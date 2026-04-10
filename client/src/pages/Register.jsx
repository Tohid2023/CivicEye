import React, { useState } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { useNavigate, Link } from "react-router-dom";
import { sendOtp, verifyOtp, registerUser, registerHelper } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  MapPin, 
  Briefcase, 
  IndianRupee, 
  CheckCircle2, 
  Send, 
  ShieldCheck,
  Navigation,
  Loader2,
  ArrowRight
} from "lucide-react";
import { cn } from "../lib/utils";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState("user"); // user or helper
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    category: "",
    village: "",
    address: "",
    latitude: "",
    longitude: "",
    expertise: "",
    serviceCharge: "",
  });

  const [locationState, setLocationState] = useState("idle"); // idle, getting, success, error
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported in your browser.");
      return;
    }

    setLocationState("getting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setLocationState("success");
      },
      (error) => {
        setLocationState("error");
        setFormData((prev) => ({
          ...prev,
          latitude: 22.1347,
          longitude: 73.4167,
        }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSendOtp = async () => {
    if (!formData.phone && !formData.email) {
      alert("Enter phone or email to receive OTP");
      return;
    }

    setOtpLoading(true);
    try {
      await sendOtp({
        role,
        phone: formData.phone,
        email: formData.email,
      });
      setOtpSent(true);
      setIsOtpVerified(false);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      alert("Enter a 6-digit OTP");
      return;
    }

    setOtpLoading(true);
    try {
      await verifyOtp({
        role,
        phone: formData.phone,
        email: formData.email,
        otp: otpCode.trim(),
      });
      setIsOtpVerified(true);
    } catch (error) {
      alert(error.response?.data?.message || "OTP verification failed");
      setIsOtpVerified(false);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!isOtpVerified) {
      alert("Please verify OTP before registering.");
      return;
    }

    try {
      setLoading(true);
      let data;
      if (role === "user") {
        data = await registerUser({
          ...formData,
          otp: otpCode.trim(),
        });
      } else {
        data = await registerHelper({
          ...formData,
          serviceCharge: Number(formData.serviceCharge) || 0,
          otp: otpCode.trim(),
        });
      }

      login(data.token, data.user || data.helper);
      if (role === "helper") {
        navigate("/helpers");
      } else {
        navigate("/home");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-mesh min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 pt-24 pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <div className="glass p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border-white/40">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Join CivicEye</h1>
              <p className="mt-3 text-slate-500 font-medium">Be part of your community's digital eye</p>
            </div>

            {/* Role Selection */}
            <div className="flex p-1.5 bg-slate-100 rounded-2xl mb-10">
              <button
                onClick={() => setRole("user")}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2",
                  role === "user" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <User size={18} />
                Community Member
              </button>
              <button
                onClick={() => setRole("helper")}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2",
                  role === "helper" ? "bg-white text-green-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Briefcase size={18} />
                Service Provider
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              {/* Personal Info Group */}
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-white/50 border border-slate-200 rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <Phone size={20} />
                    </div>
                    <input
                      type="text"
                      name="phone"
                      placeholder="Phone Number"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-white/50 border border-slate-200 rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <Mail size={20} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-white/50 border border-slate-200 rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-white/50 border border-slate-200 rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Location Group */}
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <MapPin size={20} />
                    </div>
                    <input
                      type="text"
                      name="village"
                      placeholder="Village / Area"
                      required
                      value={formData.village}
                      onChange={handleChange}
                      className="w-full bg-white/50 border border-slate-200 rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Navigation size={20} />
                    </div>
                    <input
                      type="text"
                      name="address"
                      placeholder="Detailed Address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full bg-white/50 border border-slate-200 rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={requestLocation}
                  className={cn(
                    "w-full p-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 transition-all",
                    locationState === "success" 
                      ? "bg-green-50 border-green-200 text-green-700" 
                      : locationState === "getting"
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {locationState === "getting" ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : locationState === "success" ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <Navigation size={20} />
                  )}
                  <span className="font-bold">
                    {locationState === "success" ? "Location Locked" : "Click to tag your current location"}
                  </span>
                </button>
              </div>

              {/* Role Specific Fields */}
              <AnimatePresence mode="wait">
                {role === "helper" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 pt-4 border-t border-slate-100"
                  >
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Briefcase size={20} />
                      </div>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required={role === "helper"}
                        className="w-full bg-white/50 border border-slate-200 rounded-2xl px-12 py-4 appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      >
                        <option value="">Select Category</option>
                        <option value="electrician">Electrician</option>
                        <option value="plumber">Plumber</option>
                        <option value="road-worker">Road Worker</option>
                        <option value="cleaner">Cleaner</option>
                        <option value="technician">Technician</option>
                      </select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <CheckCircle2 size={20} />
                        </div>
                        <input
                          type="text"
                          name="expertise"
                          placeholder="Your Expertise"
                          required={role === "helper"}
                          value={formData.expertise}
                          onChange={handleChange}
                          className="w-full bg-white/50 border border-slate-200 rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <IndianRupee size={20} />
                        </div>
                        <input
                          type="number"
                          name="serviceCharge"
                          placeholder="Visit Charge"
                          required={role === "helper"}
                          value={formData.serviceCharge}
                          onChange={handleChange}
                          className="w-full bg-white/50 border border-slate-200 rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* OTP Flow */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex gap-4">
                  <button
                    type="button"
                    disabled={otpLoading || (!formData.phone && !formData.email)}
                    onClick={handleSendOtp}
                    className={cn(
                      "flex-1 py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all",
                      otpSent ? "bg-slate-100 text-slate-600" : "bg-blue-600 text-white shadow-lg hover:shadow-blue-200"
                    )}
                  >
                    {otpLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    {otpSent ? "Resend OTP" : "Get Verification Code"}
                  </button>
                  {otpSent && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex-[0.8] relative">
                      <input
                        type="text"
                        placeholder="6-digit OTP"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-full bg-white border-2 border-blue-500 rounded-2xl px-6 py-4 text-center text-lg font-bold tracking-[0.5em] focus:outline-none"
                      />
                    </motion.div>
                  )}
                </div>

                {otpSent && !isOtpVerified && (
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otpLoading || otpCode.length !== 6}
                    className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-green-200"
                  >
                    {otpLoading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                    Verify Code
                  </button>
                )}

                {isOtpVerified && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-green-700 font-bold"
                  >
                    <CheckCircle2 size={24} />
                    Identity Verified. Ready to register!
                  </motion.div>
                )}
              </div>

              {/* Final Submit */}
              <button
                type="submit"
                disabled={!isOtpVerified || loading}
                className={cn(
                  "w-full py-5 rounded-[2rem] text-xl font-bold flex items-center justify-center gap-3 transition-all",
                  role === "helper" ? "btn-secondary" : "btn-primary",
                  (!isOtpVerified || loading) && "opacity-50 cursor-not-allowed transform-none shadow-none"
                )}
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : (
                  <>
                    Create My Account
                    <ArrowRight size={24} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-slate-500 font-medium">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 font-bold hover:underline">
                Login here
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Register;
