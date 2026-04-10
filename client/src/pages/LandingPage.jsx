import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 text-center px-4">
      <h1 className="text-4xl font-bold text-blue-700">
        CivicEye
      </h1>

      <p className="mt-4 text-lg text-gray-700 max-w-md">
        Report local problems and connect with nearby helpers easily.
      </p>

      <div className="mt-6 flex gap-4">
        <button
          onClick={() => navigate("/login")}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl"
        >
          Login
        </button>

        <button
          onClick={() => navigate("/register")}
          className="bg-green-600 text-white px-6 py-3 rounded-xl"
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default LandingPage;