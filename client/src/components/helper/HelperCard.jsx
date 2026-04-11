import React from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Star,
  IndianRupee,
  User,
  BadgeCheck,
  Info,
} from "lucide-react";
import { cn } from "../../lib/utils";

const HelperCard = ({
  helper,
  bookingStatus = null,
  issueLocked = false,
  lockedHelperId = null,
  allowBooking = false,
  selectedIssue = null,
}) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate("/helper-profile", { state: helper });
  };

  const handleBook = () => {
    if (!allowBooking) return;
    if (issueLocked) return;
    if (bookingStatus && bookingStatus !== "cancelled") return;

    navigate("/booking", {
      state: {
        helper,
        issue: selectedIssue,
      },
    });
  };

  const isThisAssignedHelper = lockedHelperId === helper._id;

  const formatCategory = (value) => {
    if (!value) return "Other";
    return value
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getButtonText = () => {
    if (!allowBooking) return "Select issue";

    if (issueLocked && !isThisAssignedHelper) {
      return "Issue Assigned";
    }

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
    if (!allowBooking) {
      return "bg-slate-100 text-slate-500 border border-slate-200";
    }

    if (issueLocked && !isThisAssignedHelper) {
      return "bg-slate-100 text-slate-500 border border-slate-200";
    }

    if (isThisAssignedHelper) {
      switch (bookingStatus) {
        case "pending":
          return "bg-amber-500 text-white";
        case "accepted":
          return "bg-emerald-600 text-white";
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

    switch (bookingStatus) {
      case "pending":
        return "bg-amber-500 text-white";
      case "accepted":
        return "bg-emerald-600 text-white";
      case "rejected":
        return "bg-red-500 text-white";
      case "completed":
        return "bg-blue-600 text-white";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-200";
    }
  };

  const disabled =
    !allowBooking ||
    issueLocked ||
    (bookingStatus && bookingStatus !== "cancelled");

  return (
    <div className="w-full max-w-[330px] rounded-[1.8rem] border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
              <User size={20} />
            </div>

            <div className="min-w-0">
              <h3 className="text-2xl font-extrabold leading-tight text-slate-900">
                {helper.fullName}
              </h3>

              <p className="mt-1 text-sm font-bold tracking-wide text-blue-600">
                {formatCategory(helper.category)}
              </p>

              <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin size={14} />
                <span className="truncate">{helper.village || "Nearby area"}</span>
              </div>
            </div>
          </div>

          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider",
              helper.availability === "available"
                ? "bg-emerald-100 text-emerald-700"
                : helper.availability === "busy"
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-100 text-slate-600"
            )}
          >
            <BadgeCheck size={11} />
            {helper.availability}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-slate-50 p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Dist
            </p>
            <div className="mt-2 flex items-center justify-center gap-1">
              <MapPin size={12} className="text-amber-500" />
              <p className="text-xl font-extrabold text-slate-900">
                {helper.distance ?? 0}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Rating
            </p>
            <div className="mt-2 flex items-center justify-center gap-1">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <p className="text-xl font-extrabold text-slate-900">
                {helper.averageRating ?? 0}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Fee
            </p>
            <div className="mt-2 flex items-center justify-center gap-1">
              <IndianRupee size={12} className="text-emerald-600" />
              <p className="text-xl font-extrabold text-emerald-700">
                {helper.serviceCharge ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-slate-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Expertise
          </p>
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">
            {helper.expertise || "Experienced helper"}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={handleViewProfile}
            className="rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Profile
          </button>

          <button
            onClick={handleBook}
            disabled={disabled}
            className={cn(
              "rounded-2xl py-3 text-sm font-bold transition",
              getButtonClass(),
              disabled ? "cursor-not-allowed opacity-90" : "hover:scale-[1.01]"
            )}
          >
            {getButtonText()}
          </button>
        </div>

        {!allowBooking ? (
          <div className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 border border-blue-100">
            <Info size={15} />
            Open from My Issues to book this helper
          </div>
        ) : (
          <div className="mt-3 flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white">
            Contact Specialized Help
          </div>
        )}
      </div>
    </div>
  );
};

export default HelperCard;