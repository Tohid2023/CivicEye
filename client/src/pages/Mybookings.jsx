import React, { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { getMyBookings } from "../services/bookingService";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getMyBookings();
      setBookings(data.bookings || []);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const getStatusClasses = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "accepted":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-slate-100 text-slate-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case "pending":
        return "Waiting for helper response";
      case "accepted":
        return "Helper accepted your request";
      case "rejected":
        return "Request was rejected";
      case "completed":
        return "Service completed. You can rate now.";
      case "cancelled":
        return "Booking cancelled";
      default:
        return status;
    }
  };

  return (
    <>
      <Navbar />

      <section className="min-h-screen bg-slate-50 px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
              My Bookings
            </h1>
            <p className="mt-2 text-slate-600">
              Track your helper requests and service status
            </p>
          </div>

          <div className="mt-8">
            {loading ? (
              <div className="bg-white rounded-3xl p-6 text-center shadow-sm">
                Loading bookings...
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-6 text-center shadow-sm">
                <p className="text-lg font-semibold text-slate-800">
                  No bookings found
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {bookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="bg-white rounded-3xl shadow-sm p-5 border border-slate-100"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          {booking.helper?.fullName || "Helper"}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {booking.issue?.category || "Service"} •{" "}
                          {booking.helper?.category || "Category"}
                        </p>
                      </div>

                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusClasses(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="bg-slate-50 rounded-2xl p-3">
                        <p className="text-xs text-slate-500">Issue</p>
                        <p className="text-sm font-medium text-slate-800 mt-1">
                          {booking.issue?.description || "No description"}
                        </p>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-3">
                        <p className="text-xs text-slate-500">Status Message</p>
                        <p className="text-sm font-medium text-slate-800 mt-1">
                          {getStatusMessage(booking.status)}
                        </p>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-3">
                        <p className="text-xs text-slate-500">Service Address</p>
                        <p className="text-sm font-medium text-slate-800 mt-1">
                          {booking.address || "N/A"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 rounded-2xl p-3">
                          <p className="text-xs text-slate-500">Preferred Date</p>
                          <p className="text-sm font-medium text-slate-800 mt-1">
                            {booking.preferredDate || "N/A"}
                          </p>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-3">
                          <p className="text-xs text-slate-500">Preferred Time</p>
                          <p className="text-sm font-medium text-slate-800 mt-1">
                            {booking.preferredTime || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-3">
                        <p className="text-xs text-slate-500">Helper Contact</p>
                        <p className="text-sm font-medium text-slate-800 mt-1">
                          {booking.status === "accepted" ||
                          booking.status === "completed"
                            ? booking.helper?.phone || "N/A"
                            : "Visible after helper accepts the request"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
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