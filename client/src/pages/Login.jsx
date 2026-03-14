import React, { useState } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import Button from "../components/common/Button";
import { Link, useNavigate } from "react-router-dom";
import { loginAccount } from "../services/authService";
import { useAuth } from "../context/AuthContext";

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

      login(data.token, data.account);

      alert(data.message);

      if (data.account.role === "helper") {
        navigate("/helpers");
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
    <>
      <Navbar />

      <section className="min-h-screen bg-blue-50 px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-6 sm:p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900">Login</h1>
            <p className="mt-2 text-slate-600">
              Login using email or phone number
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Login As
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-4"
              >
                <option value="user">User</option>
                <option value="helper">Helper</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email or Phone Number
              </label>
              <input
                type="text"
                name="emailOrPhone"
                placeholder="Enter email or phone"
                value={formData.emailOrPhone}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-4"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-4"
              />
            </div>

            <Button
              type="submit"
              text={loading ? "Logging in..." : "Login"}
              className="bg-blue-600 text-white text-lg py-4 rounded-2xl"
            />
          </form>

          <p className="text-center text-sm text-slate-600 mt-5">
            Don’t have an account?{" "}
            <Link to="/register" className="text-blue-600 font-semibold">
              Register
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Login;
