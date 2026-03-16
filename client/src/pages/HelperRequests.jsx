import React, { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import {
  getHelperBookings,
  updateBookingStatus,
} from "../services/bookingService";

const HelperRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getHelperBookings();
      setRequests(data.bookings || []);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to fetch helper requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      setUpdatingId(bookingId);
      await updateBookingStatus(bookingId, status);
      alert(`Booking ${status} successfully`);
      await fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update booking status");
    } finally {
      setUpdatingId("");
    }
  };

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

  return (
    <>
      <Navbar />

      <section className="min-h-screen bg-slate-50 px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Helper Requests
            </h1>
            <p className="mt-2 text-slate-600">
              View, accept, reject, and complete user service requests
            </p>
          </div>

          <div className="mt-8">
            {loading ? (
              <div className="bg-white rounded-3xl p-6 text-center shadow-sm">
                Loading requests...
              </div>
            ) : requests.length === 0 ? (
              <div className="bg-white rounded-3xl p-6 text-center shadow-sm">
                <p className="text-lg font-semibold text-slate-800">
                  No requests found
                </p>
                <p className="mt-2 text-slate-600">
                  When users book you, requests will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {requests.map((booking) => (
                  <div
                    key={booking._id}
                    className="bg-white rounded-3xl shadow-sm p-5 border border-slate-100"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          {booking.user?.fullName || "User"}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {booking.issue?.category || "Issue"} •{" "}
                          {booking.user?.village || "Village"}
                        </p>
                      </div>

                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusClasses(
                          booking.status,
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {booking.issue?.image ? (
                        <div className="bg-slate-50 rounded-2xl p-3">
                          <p className="text-xs text-slate-500 mb-2">
                            Uploaded Issue Image
                          </p>
                          <img
                            src={`http://localhost:8080${booking.issue.image}`}
                            alt="Issue"
                            className="w-full h-48 object-cover rounded-xl border border-slate-200"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="bg-slate-50 rounded-2xl p-3">
                          <p className="text-xs text-slate-500">
                            Uploaded Issue Image
                          </p>
                          <p className="text-sm font-medium text-slate-800 mt-1">
                            No image uploaded
                          </p>
                        </div>
                      )}

                      <div className="bg-slate-50 rounded-2xl p-3">
                        <p className="text-xs text-slate-500">
                          Service Address
                        </p>
                        <p className="text-sm font-medium text-slate-800 mt-1">
                          {booking.address || "No address"}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-slate-50 rounded-2xl p-3">
                          <p className="text-xs text-slate-500">
                            Preferred Date
                          </p>
                          <p className="text-sm font-medium text-slate-800 mt-1">
                            {booking.preferredDate || "N/A"}
                          </p>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-3">
                          <p className="text-xs text-slate-500">
                            Preferred Time
                          </p>
                          <p className="text-sm font-medium text-slate-800 mt-1">
                            {booking.preferredTime || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-3">
                        <p className="text-xs text-slate-500">User Phone</p>
                        <p className="text-sm font-medium text-slate-800 mt-1">
                          {booking.user?.phone || "N/A"}
                        </p>
                      </div>

                      {booking.note ? (
                        <div className="bg-slate-50 rounded-2xl p-3">
                          <p className="text-xs text-slate-500">Note</p>
                          <p className="text-sm font-medium text-slate-800 mt-1">
                            {booking.note}
                          </p>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() =>
                          handleStatusUpdate(booking._id, "accepted")
                        }
                        disabled={
                          updatingId === booking._id ||
                          booking.status === "accepted" ||
                          booking.status === "completed"
                        }
                        className="rounded-2xl bg-green-600 text-white py-3 font-semibold disabled:opacity-50"
                      >
                        {updatingId === booking._id ? "Updating..." : "Accept"}
                      </button>

                      <button
                        onClick={() =>
                          handleStatusUpdate(booking._id, "rejected")
                        }
                        disabled={
                          updatingId === booking._id ||
                          booking.status === "rejected" ||
                          booking.status === "completed"
                        }
                        className="rounded-2xl bg-red-500 text-white py-3 font-semibold disabled:opacity-50"
                      >
                        {updatingId === booking._id ? "Updating..." : "Reject"}
                      </button>

                      <button
                        onClick={() =>
                          handleStatusUpdate(booking._id, "completed")
                        }
                        disabled={
                          updatingId === booking._id ||
                          booking.status !== "accepted"
                        }
                        className="rounded-2xl bg-blue-600 text-white py-3 font-semibold disabled:opacity-50"
                      >
                        {updatingId === booking._id
                          ? "Updating..."
                          : "Complete"}
                      </button>
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

export default HelperRequests;
