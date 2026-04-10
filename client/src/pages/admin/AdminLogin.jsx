import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../../services/adminService";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Loader2,
  ChevronLeft
} from "lucide-react";
import { cn } from "../../lib/utils";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      const data = await loginAdmin(formData);
      login(data.token, data.admin);
      navigate("/admin-dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Admin authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-mesh min-h-screen flex flex-col">
      {/* Back to Site Link */}
      <div className="p-6">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-blue-600 transition-colors group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to CivicEye
        </button>
      </div>

      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          <div className="glass p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-white/50 relative overflow-hidden">
            {/* Header */}
            <div className="text-center relative z-10 mb-10">
              <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-slate-200">
                <ShieldCheck size={40} />
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Admin Console</h1>
              <p className="mt-3 text-slate-500 font-medium">Verify your credentials to manage the platform</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">Secure Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="admin@civiceye.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white/50 border border-slate-200 rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">Access Key</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-white/50 border border-slate-200 rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-5 rounded-[2rem] bg-slate-900 text-white text-xl font-bold hover:bg-slate-800 transition-all hover:scale-[1.02] shadow-xl shadow-slate-200 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : (
                  <>
                    Authorize Access
                    <ArrowRight size={24} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] relative z-10">
              End-to-End Encrypted Management Session
            </div>

            {/* Background design */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-900/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminLogin;