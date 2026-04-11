import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { getMyBookings } from "../services/bookingService";
import { getMyRatings } from "../services/ratingService";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  IndianRupee,
  Loader2,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { cn } from "../lib/utils";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [myRatings, setMyRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const [bookingData, ratingData] = await Promise.all([
        getMyBookings(),
        getMyRatings().catch(() => ({ ratings: [] })),
      ]);

      setBookings(bookingData.bookings || []);
      setMyRatings(ratingData.ratings || []);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const ratedBookingIds = useMemo(() => {
    return new Set(
      myRatings.map((item) => item.booking?._id).filter(Boolean)
    );
  }, [myRatings]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const active = bookings.filter((b) =>
      ["pending", "accepted", "in-progress"].includes(b.status)
    ).length;
    const completed = bookings.filter((b) => b.status === "completed").length;
    const toRate = bookings.filter(
      (b) => b.status === "completed" && !ratedBookingIds.has(b._id)
    ).length;

    return { total, active, completed, toRate };
  }, [bookings, ratedBookingIds]);

  const getStatusClasses = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-500 text-white";
      case "accepted":
        return "bg-emerald-600 text-white";
      case "in-progress":
        return "bg-blue-600 text-white";
      case "completed":
        return "bg-indigo-600 text-white";
      case "cancelled":
        return "bg-slate-500 text-white";
      case "rejected":
        return "bg-red-500 text-white";
      default:
        return "bg-slate-500 text-white";
    }
  };

  const getStatusMessage = (status, bookingId) => {
    const isRated = ratedBookingIds.has(bookingId);

    switch (status) {
      case "pending":
        return "Waiting for helper response";
      case "accepted":
        return "Helper accepted your request";
      case "in-progress":
        return "Service is currently in progress";
      case "rejected":
        return "Request was rejected";
      case "completed":
        return isRated
          ? "Service completed and your rating was submitted"
          : "Service completed. You can rate this booking now.";
      case "cancelled":
        return "Booking cancelled";
      default:
        return status;
    }
  };

  const handleToggle = (bookingId) => {
    setExpandedId((prev) => (prev === bookingId ? null : bookingId));
  };

  const handleRateNow = (bookingId) => {
    localStorage.setItem("selected_booking_id", bookingId);
    navigate("/rating");
  };

  const handleBookAgain = (booking) => {
    navigate("/helpers", {
      state: {
        issue: booking.issue,
      },
    });
  };

  return (
    <>
      <Navbar />

      <section className="min-h-screen bg-mesh px-4 py-6 pt-28">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-[2.4rem] border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  My Bookings
                </h1>
                <p className="mt-2 max-w-2xl text-slate-500 font-medium">
                  Track your helper requests, monitor service progress, and rate
                  completed work from one place.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-[1.4rem] border border-blue-100 bg-blue-50 px-4 py-4 min-w-[110px]">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Total
                  </p>
                  <p className="mt-1 text-4xl font-extrabold text-blue-700">
                    {stats.total}
                  </p>
                </div>

                <div className="rounded-[1.4rem] border border-amber-100 bg-amber-50 px-4 py-4 min-w-[110px]">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Active
                  </p>
                  <p className="mt-1 text-4xl font-extrabold text-amber-700">
                    {stats.active}
                  </p>
                </div>

                <div className="rounded-[1.4rem] border border-emerald-100 bg-emerald-50 px-4 py-4 min-w-[110px]">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Completed
                  </p>
                  <p className="mt-1 text-4xl font-extrabold text-emerald-700">
                    {stats.completed}
                  </p>
                </div>

                <div className="rounded-[1.4rem] border border-purple-100 bg-purple-50 px-4 py-4 min-w-[110px]">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    To Rate
                  </p>
                  <p className="mt-1 text-4xl font-extrabold text-purple-700">
                    {stats.toRate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            {loading ? (
              <div className="rounded-[2rem] border border-white/60 bg-white/80 p-10 text-center shadow-md backdrop-blur-xl">
                <Loader2
                  size={40}
                  className="mx-auto mb-4 animate-spin text-blue-600"
                />
                <p className="text-lg font-bold text-slate-700">
                  Loading bookings...
                </p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="rounded-[2rem] border border-white/60 bg-white/80 p-10 text-center shadow-md backdrop-blur-xl">
                <ShieldCheck size={42} className="mx-auto mb-4 text-slate-300" />
                <p className="text-xl font-bold text-slate-900">
                  No bookings found
                </p>
                <p className="mt-2 text-slate-500">
                  Your helper requests will appear here once you make a booking.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {bookings.map((booking) => {
                  const isExpanded = expandedId === booking._id;
                  const isRated = ratedBookingIds.has(booking._id);

                  return (
                    <div
                      key={booking._id}
                      className="self-start rounded-[2rem] border border-white/60 bg-white/80 p-5 shadow-md backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-200">
                            <User size={22} />
                          </div>

                          <div className="min-w-0">
                            <h3 className="text-base font-semibold text-slate-900 truncate">
                              {booking.helper?.fullName || "Helper"}
                            </h3>

                            <p className="mt-1 text-sm font-bold uppercase tracking-wide text-slate-500">
                              {booking.issue?.category || "Service"} •{" "}
                              {booking.helper?.category || "Category"}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
                                <CalendarDays size={12} />
                                {booking.preferredDate || "N/A"}
                              </span>

                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
                                <Clock3 size={12} />
                                {booking.preferredTime || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                          <span
                            className={cn(
                              "rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider",
                              getStatusClasses(booking.status)
                            )}
                          >
                            {booking.status}
                          </span>

                          <button
                            onClick={() => handleToggle(booking._id)}
                            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          >
                            {isExpanded ? (
                              <ChevronUp size={18} />
                            ) : (
                              <ChevronDown size={18} />
                            )}
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="rounded-xl bg-slate-50/70 p-3 border border-slate-100">
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                              Issue Description
                            </p>
                            <p className="mt-2 text-sm font-medium text-slate-700">
                              {booking.issue?.description || "No description"}
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-50/70 p-3 border border-slate-100">
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                              Status Message
                            </p>
                            <p className="mt-2 text-sm font-medium text-slate-700">
                              {getStatusMessage(booking.status, booking._id)}
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-50/70 p-3 border border-slate-100">
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                              Service Address
                            </p>
                            <p className="mt-2 text-sm font-medium text-slate-700">
                              {booking.address || "N/A"}
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-50/70 p-3 border border-slate-100">
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                              Helper Contact
                            </p>
                            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                              <Phone size={14} />
                              {booking.status === "accepted" ||
                              booking.status === "completed" ||
                              booking.status === "in-progress"
                                ? booking.helper?.phone || "N/A"
                                : "Visible after helper accepts the request"}
                            </p>
                          </div>

                          {!!booking.issue?.image && (
                            <div className="md:col-span-2 rounded-xl bg-slate-50/70 p-3">
                              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                Attached Visual
                              </p>
                              <img
                                src={`http://localhost:8080${booking.issue.image}`}
                                alt="Issue"
                                className="mt-3 h-32 w-full rounded-xl object-cover"
                              />
                            </div>
                          )}

                          <div className="md:col-span-2 grid grid-cols-2 gap-3 pt-1">
                            {booking.status === "completed" ? (
                              isRated ? (
                                <div className="col-span-1 flex items-center justify-center gap-2 rounded-2xl bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
                                  Rated <CheckCircle2 size={16} />
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleRateNow(booking._id)}
                                  className="col-span-1 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 px-4 py-2 text-sm font-bold text-white transition hover:from-slate-800 hover:to-slate-700"
                                >
                                  Rate Now
                                </button>
                              )
                            ) : (
                              <div className="col-span-1 flex items-center justify-center rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500">
                                {booking.status === "accepted"
                                  ? "Service Active"
                                  : "Waiting"}
                              </div>
                            )}

                            <button
                              onClick={() => handleBookAgain(booking)}
                              className="col-span-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                            >
                              Book Again
                            </button>
                          </div>

                          {booking.helper?.serviceCharge ? (
                            <div className="md:col-span-2 rounded-xl bg-slate-50/70 p-3 border border-slate-100">
                              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                Standard Fee
                              </p>
                              <p className="mt-2 flex items-center gap-1 text-sm font-bold text-slate-800">
                                <IndianRupee size={14} />
                                {booking.helper.serviceCharge}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default MyBookings;