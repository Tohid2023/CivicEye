import React from "react";
import { useNavigate } from "react-router-dom";

const HelperCard = ({
  helper,
  bookingStatus = null,
  issueLocked = false,
  lockedHelperId = null,
  allowBooking = false,
}) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate("/helper-profile", { state: helper });
  };

  const handleBook = () => {
    if (!allowBooking) return;
    if (issueLocked) return;
    if (bookingStatus && bookingStatus !== "cancelled") return;
    navigate("/booking", { state: helper });
  };

  const isThisAssignedHelper = lockedHelperId === helper._id;

  const getButtonText = () => {
    // 🚫 Navbar case (no issue selected)
    if (!allowBooking) {
      return "Select Issue";
    }

    // 🔒 Issue already locked (other helpers)
    if (issueLocked && !isThisAssignedHelper) {
      return "Issue Assigned";
    }

    // ✅ Assigned helper
    if (isThisAssignedHelper) {
      switch (bookingStatus) {
        case "pending":
          return "Request Sent";
        case "accepted":
          return "Accepted";
        case "in-progress":
          return "In Progress";
        case "completed":
          return "Completed";
        case "rejected":
          return "Rejected";
        default:
          return "Assigned";
      }
    }

    // 🟢 Normal case
    switch (bookingStatus) {
      case "pending":
        return "Request Sent";
      case "accepted":
        return "Accepted";
      case "rejected":
        return "Rejected";
      case "completed":
        return "Completed";
      default:
        return "Book Now";
    }
  };

  const getButtonClass = () => {
    // 🚫 Navbar case
    if (!allowBooking) {
      return "bg-slate-400 text-white";
    }

    // 🔒 Other helpers disabled
    if (issueLocked && !isThisAssignedHelper) {
      return "bg-slate-400 text-white";
    }

    // ✅ Assigned helper styling
    if (isThisAssignedHelper) {
      switch (bookingStatus) {
        case "pending":
          return "bg-yellow-500 text-white";
        case "accepted":
          return "bg-green-600 text-white";
        case "in-progress":
          return "bg-blue-600 text-white";
        case "completed":
          return "bg-indigo-600 text-white";
        case "rejected":
          return "bg-red-500 text-white";
        default:
          return "bg-slate-500 text-white";
      }
    }

    // 🟢 Normal case
    switch (bookingStatus) {
      case "pending":
        return "bg-yellow-500 text-white";
      case "accepted":
        return "bg-green-600 text-white";
      case "rejected":
        return "bg-red-500 text-white";
      case "completed":
        return "bg-blue-600 text-white";
      default:
        return "bg-green-600 text-white";
    }
  };

  const disabled =
    !allowBooking ||
    issueLocked ||
    (bookingStatus && bookingStatus !== "cancelled");

  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 border border-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">
            {helper.fullName}
          </h3>
          <p className="text-sm font-semibold text-blue-600 uppercase">
            {helper.category}
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-700">
          {helper.availability}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-400 uppercase">Distance</p>
          <p className="text-3xl font-bold text-slate-900">
            {helper.distance ?? "N/A"}
            {helper.distance ? "km" : ""}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-400 uppercase">Rating</p>
          <p className="text-3xl font-bold text-slate-900">
            {helper.averageRating ?? 0}
          </p>
        </div>

        <div className="col-span-2">
          <p className="text-xs text-slate-400 uppercase">Standard Fee</p>
          <p className="text-3xl font-bold text-slate-900">
            ₹{helper.serviceCharge ?? 0}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={handleViewProfile}
          className="rounded-2xl border border-slate-300 py-3 font-semibold text-slate-700"
        >
          Profile
        </button>

        <button
          onClick={handleBook}
          disabled={disabled}
          className={`rounded-2xl py-3 font-semibold ${getButtonClass()} ${
            disabled ? "opacity-80 cursor-not-allowed" : ""
          }`}
        >
          {getButtonText()}
        </button>
      </div>

      <div className="mt-3 w-full rounded-2xl bg-blue-600 text-white py-3 font-semibold text-center">
        Contact Specialized Help
      </div>
    </div>
  );
};

export default HelperCard;