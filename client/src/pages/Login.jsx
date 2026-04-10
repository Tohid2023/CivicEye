import React, { useState } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { Link, useNavigate } from "react-router-dom";
import { loginAccount } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
    role: "user",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);

    const data = await loginAccount(formData);

    // Save token + user
    login(data.token, data.account);

    // Role-based redirect
    if (data.account.role === "helper") {
      navigate("/helper-requests");
    } else {
      navigate("/home");
    }

  } catch (error) {
    alert(error.response?.data?.message || "Login failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="bg-mesh min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 pt-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="glass p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border-white/40">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
              <p className="mt-3 text-slate-500 font-medium">Access your community dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Login As</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <User size={20} />
                  </div>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full bg-white/50 border border-slate-200 rounded-2xl px-12 py-4 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium text-slate-700"
                  >
                    <option value="user">Community Member (User)</option>
                    <option value="helper">Service Provider (Helper)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Email or Phone</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail size={20} />
                  </div>
                  <input
                    type="text"
                    name="emailOrPhone"
                    placeholder="name@example.com"
                    value={formData.emailOrPhone}
                    onChange={handleChange}
                    className="w-full bg-white/50 border border-slate-200 rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-white/50 border border-slate-200 rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 mt-4 flex items-center justify-center gap-2 group disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-slate-200 text-center">
              <p className="text-slate-500 font-medium">
                New to CivicEye?{" "}
                <Link to="/register" className="text-blue-600 font-bold hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
