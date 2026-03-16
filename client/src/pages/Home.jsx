import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import CategoryGrid from "../components/home/CategoryGrid";

const Home = () => {
  return (
    <>
      <Navbar />

      <section className="min-h-screen bg-slate-50 px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-green-500 rounded-3xl p-6 sm:p-8 shadow-lg">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Welcome to CivicEye
            </h1>

            <p className="mt-3 text-base sm:text-lg text-blue-50">
              Solve local problems with nearby helpers
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                to="/report"
                className="block bg-white text-blue-700 font-semibold text-center py-4 rounded-2xl shadow-sm border border-slate-200"
              >
                <span className="text-blue-700">Report Problem</span>
              </Link>

              <Link
                to="/helpers"
                className="block bg-white text-green-700 font-semibold text-center py-4 rounded-2xl shadow-sm border border-slate-200"
              >
                <span className="text-green-700">Find Helpers</span>
              </Link>

              <Link
                to="/rating"
                className="block bg-white text-slate-700 font-semibold text-center py-4 rounded-2xl shadow-sm border border-slate-200"
              >
                <span className="text-slate-700">Give Rating</span>
              </Link>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Choose Problem Category
            </h2>
            <p className="mt-2 text-slate-600">
              Select the type of issue you want to report
            </p>
          </div>

          <div className="mt-6">
            <CategoryGrid />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Home;