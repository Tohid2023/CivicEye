import React, { useState } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import Button from "../components/common/Button";
import { useNavigate } from "react-router-dom";
import { sendOtp, verifyOtp, registerUser, registerHelper } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);

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

  const [locationAllowed, setLocationAllowed] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
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

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationAllowed(true);

        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));

        alert("Location permission granted");
      },
      (error) => {
        console.log(error);

        setLocationAllowed(false);

        setFormData((prev) => ({
          ...prev,
          latitude: 22.1347,
          longitude: 73.4167,
        }));

        alert("Location permission denied. Using default location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
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
      alert("OTP sent. Check your phone/email and enter below.");
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
      alert("OTP verified. Now submit registration.");
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
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
          address: formData.address,
          village: formData.village,
          latitude: formData.latitude,
          longitude: formData.longitude,
          otp: otpCode.trim(),
        });
      } else {
        data = await registerHelper({
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
          category: formData.category,
          village: formData.village,
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude,
          expertise: formData.expertise,
          serviceCharge: Number(formData.serviceCharge) || 0,
          otp: otpCode.trim(),
        });
      }

      login(data.token, data.user || data.helper);

      alert(data.message);

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
    <>
      <Navbar />

      <section className="min-h-screen bg-green-50 px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-lg p-6 sm:p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900">
              Register on CivicEye
            </h1>
            <p className="mt-2 text-slate-600">
              Create account as User or Helper
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("user")}
              className={`rounded-2xl py-3 font-semibold ${
                role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              Register as User
            </button>

            <button
              type="button"
              onClick={() => setRole("helper")}
              className={`rounded-2xl py-3 font-semibold ${
                role === "helper"
                  ? "bg-green-600 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              Register as Helper
            </button>
          </div>

          <form onSubmit={handleRegister} className="mt-6 space-y-5">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-4"
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 px-4 py-4"
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 px-4 py-4"
              />
            </div>

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-4"
            />

            <input
              type="text"
              name="village"
              placeholder="Village / Area"
              value={formData.village}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-4"
            />

            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-4"
            />

            {role === "helper" && (
              <>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-4"
                >
                  <option value="">Select category</option>
                  <option value="electrician">Electrician</option>
                  <option value="plumber">Plumber</option>
                  <option value="road-worker">Road Worker</option>
                  <option value="cleaner">Cleaner</option>
                  <option value="technician">Technician</option>
                  <option value="other">Other</option>
                </select>

                <input
                  type="text"
                  name="expertise"
                  placeholder="Expertise"
                  value={formData.expertise}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-4"
                />

                <input
                  type="number"
                  name="serviceCharge"
                  placeholder="Approximate Service Charge"
                  value={formData.serviceCharge}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-4"
                />
              </>
            )}

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Location Permission
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Allow location so CivicEye can find nearby helpers.
              </p>

              <button
                type="button"
                onClick={requestLocation}
                className="mt-3 w-full rounded-2xl bg-blue-100 text-blue-700 py-3 font-semibold"
              >
                {locationAllowed ? "Location Granted" : "Allow Location"}
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 items-end mt-4">
              <button
                type="button"
                disabled={otpLoading || (!formData.phone && !formData.email)}
                onClick={handleSendOtp}
                className="w-full rounded-2xl bg-indigo-600 text-white py-3 font-semibold disabled:opacity-60"
              >
                {otpLoading ? "Sending OTP..." : otpSent ? "Resend OTP" : "Get OTP"}
              </button>

              <button
                type="button"
                disabled={otpLoading || !otpSent}
                onClick={handleVerifyOtp}
                className="w-full rounded-2xl bg-emerald-600 text-white py-3 font-semibold disabled:opacity-60"
              >
                {otpLoading ? "Verifying..." : isOtpVerified ? "OTP Verified" : "Verify OTP"}
              </button>
            </div>

            {otpSent && (
              <input
                type="text"
                name="otp"
                placeholder="Enter 6-digit OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                className="w-full rounded-2xl border border-slate-300 px-4 py-4 mt-3"
              />
            )}

            <div className="rounded-2xl border p-3 mt-3 text-sm font-medium">
              {!otpSent ? (
                <p className="text-amber-700 bg-amber-100 rounded-lg p-2">Request an OTP to verify email before registering.</p>
              ) : !isOtpVerified ? (
                <p className="text-blue-800 bg-blue-100 rounded-lg p-2">OTP sent. Please verify to enable registration.</p>
              ) : (
                <p className="text-emerald-800 bg-emerald-100 rounded-lg p-2">OTP verified. You can now submit the form.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isOtpVerified || loading}
              className={`w-full text-white text-lg py-4 rounded-2xl font-semibold transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : !isOtpVerified
                    ? "bg-slate-300 cursor-not-allowed"
                    : role === "user"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading
                ? "Please wait..."
                : role === "user"
                  ? "Create User Account"
                  : "Create Helper Account"}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Register;
