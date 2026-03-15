import React from "react";
import { useNavigate } from "react-router-dom";

const HelperCard = ({ helper }) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate("/helper-profile", { state: helper });
  };

  const handleBook = () => {
    navigate("/booking", { state: helper });
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 border border-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            {helper.fullName || helper.name || "Helper"}
          </h3>
          <p className="text-sm text-slate-600 mt-1">{helper.category}</p>
        </div>

        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            helper.availability === "available"
              ? "bg-green-100 text-green-700"
              : helper.availability === "busy"
              ? "bg-red-100 text-red-700"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {helper.availability || "Unknown"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-2xl p-3">
          <p className="text-xs text-slate-500">Distance</p>
          <p className="text-base font-semibold text-slate-800">
            {helper.distance ? `${helper.distance} km` : "N/A"}
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-3">
          <p className="text-xs text-slate-500">Rating</p>
          <p className="text-base font-semibold text-slate-800">
            ⭐ {helper.averageRating || helper.rating || 0}
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-3 col-span-2">
          <p className="text-xs text-slate-500">Approximate Charge</p>
          <p className="text-base font-semibold text-slate-800">
            ₹{helper.serviceCharge || helper.charge || 0}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={handleViewProfile}
          className="rounded-2xl border border-blue-200 text-blue-700 py-3 font-semibold"
        >
          View Profile
        </button>

        <button
          onClick={handleBook}
          className="rounded-2xl bg-green-600 text-white py-3 font-semibold"
        >
          Book
        </button>
      </div>

      <button className="mt-3 w-full rounded-2xl bg-blue-600 text-white py-3 font-semibold">
        Contact
      </button>
    </div>
  );
};

export default HelperCard;