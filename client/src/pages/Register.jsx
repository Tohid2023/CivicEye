import React, { useState } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import Button from "../components/common/Button";

const Register = () => {
  const [role, setRole] = useState("user");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    category: "",
    village: "",
  });

  const [locationAllowed, setLocationAllowed] = useState(false);

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
      () => {
        setLocationAllowed(true);
        alert("Location permission granted");
      },
      () => {
        setLocationAllowed(false);
        alert("Location permission denied");
      }
    );
  };

  const handleRegister = (e) => {
    e.preventDefault();
    console.log("Register Data:", { role, ...formData, locationAllowed });
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
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 px-4 py-4 outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-4 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-4 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Create password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 px-4 py-4 outline-none focus:border-blue-500"
              />
            </div>

            {role === "helper" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Service Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-4 outline-none focus:border-blue-500"
                  >
                    <option value="">Select category</option>
                    <option value="electrician">Electrician</option>
                    <option value="plumber">Plumber</option>
                    <option value="road-worker">Road Worker</option>
                    <option value="cleaner">Cleaner</option>
                    <option value="technician">Technician</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Village / Area
                  </label>
                  <input
                    type="text"
                    name="village"
                    placeholder="Enter village or area"
                    value={formData.village}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-4 outline-none focus:border-blue-500"
                  />
                </div>
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

            <Button
              type="submit"
              text={role === "user" ? "Create User Account" : "Create Helper Account"}
              className={`text-white text-lg py-4 rounded-2xl ${
                role === "user" ? "bg-blue-600" : "bg-green-600"
              }`}
            />
          </form>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Register;