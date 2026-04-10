import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { createIssue } from "../services/issueService";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PlusCircle, 
  Camera, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  Zap,
  Droplet,
  Road,
  Trash2,
  MoreHorizontal,
  Image as ImageIcon
} from "lucide-react";
import { cn } from "../lib/utils";

const categoryIcons = {
  electricity: Zap,
  plumbing: Droplet,
  road: Road,
  cleaning: Trash2,
  other: MoreHorizontal,
};

const ReportIssue = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category: "",
    description: "",
    image: null,
    address: "",
    latitude: "",
    longitude: "",
  });

  const [locationStatus, setLocationStatus] = useState("idle"); // idle, detecting, success, error
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const selectedCategory = queryParams.get("category");

    if (selectedCategory) {
      setFormData((prev) => ({
        ...prev,
        category: selectedCategory,
      }));
    }
  }, [location.search]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
      
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported in this browser.");
      return;
    }

    setLocationStatus("detecting");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setLocationStatus("success");
      },
      (error) => {
        console.error("Location error:", error.code, error.message);
        setLocationStatus("error");
        
        let errorMsg = "Could not detect location automatically.";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = "Location access denied. Please allow permission or enter the address manually.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = "Location information unavailable. Please enter the address manually.";
            break;
          case error.TIMEOUT:
            errorMsg = "Location request timed out. Please try again or enter manually.";
            break;
          default:
            errorMsg = "An unknown error occurred. Please enter the address manually.";
        }
        alert(errorMsg);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) return alert("Please select a category");

    try {
      setLoading(true);
      const issueFormData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) issueFormData.append(key, formData[key]);
      });

      const data = await createIssue(issueFormData);
      localStorage.setItem("selected_issue_id", data.issue._id);
      navigate("/helpers");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit issue");
    } finally {
      setLoading(false);
    }
  };

  const SelectedIcon = categoryIcons[formData.category] || PlusCircle;

  return (
    <div className="bg-mesh min-h-screen">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-28 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 md:p-12 rounded-[3rem] shadow-2xl border-white/50"
        >
          <div className="text-center mb-12">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-blue-200"
            >
              <SelectedIcon size={40} />
            </motion.div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Report an Issue</h1>
            <p className="mt-3 text-slate-500 font-medium max-w-lg mx-auto">
              Tell us what's happening and we'll help you find a professional to fix it.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column: Details */}
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block tracking-wide uppercase">Issue Category</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <SelectedIcon size={20} />
                    </div>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/50 border border-slate-200 rounded-2xl px-12 py-4 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium text-slate-700"
                    >
                      <option value="">Select Category</option>
                      <option value="electricity">Electricity Issues</option>
                      <option value="plumbing">Plumbing Issues</option>
                      <option value="road">Road Problems</option>
                      <option value="cleaning">Sanitation / Cleaning</option>
                      <option value="other">Other Issues</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block tracking-wide uppercase">Describe the Problem</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    placeholder="Provide as much detail as possible to help the helper understand the issue..."
                    className="w-full h-48 bg-white/50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>

              {/* Right Column: Media & Location */}
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block tracking-wide uppercase">Visual Evidence</label>
                  <div className="grid grid-cols-1 gap-4">
                    {!imagePreview ? (
                      <div className="flex gap-4">
                        <label className="flex-1 flex flex-col items-center justify-center aspect-square rounded-3xl border-2 border-dashed border-slate-200 bg-white/30 hover:bg-white/50 hover:border-blue-400 transition-all cursor-pointer group">
                          <Camera size={32} className="text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" />
                          <span className="text-sm font-bold text-slate-500 group-hover:text-blue-600">Camera</span>
                          <input type="file" name="image" accept="image/*" capture="environment" onChange={handleChange} className="hidden" />
                        </label>
                        <label className="flex-1 flex flex-col items-center justify-center aspect-square rounded-3xl border-2 border-dashed border-slate-200 bg-white/30 hover:bg-white/50 hover:border-blue-400 transition-all cursor-pointer group">
                          <ImageIcon size={32} className="text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" />
                          <span className="text-sm font-bold text-slate-500 group-hover:text-blue-600">Gallery</span>
                          <input type="file" name="image" accept="image/*" onChange={handleChange} className="hidden" />
                        </label>
                      </div>
                    ) : (
                      <div className="relative group rounded-3xl overflow-hidden aspect-video shadow-lg border border-white/50">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => { setImagePreview(null); setFormData(p => ({...p, image: null})); }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700 ml-1 block tracking-wide uppercase">Location Details</label>
                  <button
                    type="button"
                    onClick={detectLocation}
                    className={cn(
                      "w-full flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-dashed transition-all",
                      locationStatus === "success" ? "bg-green-50 border-green-200 text-green-700" : 
                      locationStatus === "detecting" ? "bg-blue-50 border-blue-200 text-blue-700" :
                      "bg-white/30 border-slate-200 text-slate-600 hover:border-blue-400"
                    )}
                  >
                    {locationStatus === "detecting" ? <Loader2 className="animate-spin" size={20} /> : <Navigation size={20} />}
                    <span className="font-bold">
                      {locationStatus === "success" ? "GPS Coordinates Locked" : "Tag My Current Location"}
                    </span>
                  </button>
                  
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <MapPin size={20} />
                    </div>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Street name, landmark..."
                      className="w-full bg-white/50 border border-slate-200 rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-5 rounded-[2rem] text-xl font-bold flex items-center justify-center gap-3 shadow-xl hover:shadow-blue-200 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : (
                  <>
                    Submit Report & Find Helpers
                    <ArrowRight size={24} />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default ReportIssue;
